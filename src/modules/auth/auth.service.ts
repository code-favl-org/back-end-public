import { createHash, randomBytes, randomUUID } from 'node:crypto';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { compare } from 'bcryptjs';
import { IsNull, MoreThan, Not, Repository } from 'typeorm';

import { AuthSession } from './entities/auth-session.entity';
import { User } from '../users/entities/user.entity';

const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * 60 * MINUTE_MS;
const AUTH_STRATEGIES = ['cookie', 'bearer', 'both'] as const;

export type AuthStrategy = (typeof AUTH_STRATEGIES)[number];

export type AuthenticatedUser = Pick<
  User,
  'id' | 'usuario' | 'email' | 'role'
> & {
  permissions?: string[];
};

interface SessionJwtClaims {
  sub: string;
  sid: number;
  typ: 'access' | 'refresh';
  jti: string;
  role?: string;
  permissions?: unknown;
  usuario?: string;
  email?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessExpiresAt: Date;
  refreshExpiresAt: Date;
  user: AuthenticatedUser;
}

export class AccessTokenExpiredException extends UnauthorizedException {
  constructor() {
    super('Access token expirado.');
    this.name = 'AccessTokenExpiredException';
  }
}

@Injectable()
export class AuthService implements OnModuleInit, OnModuleDestroy {
  readonly strategy: AuthStrategy;
  readonly accessTokenTtlMs: number;
  readonly refreshTokenTtlMs: number;
  readonly cookieTtlMs: number;
  readonly absoluteSessionTtlMs: number;

  private readonly revokedSessions = new Map<number, number>();
  private readonly logger = new Logger(AuthService.name);
  private expirySweep?: NodeJS.Timeout;

  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,

    @InjectRepository(AuthSession)
    private readonly sessions: Repository<AuthSession>,

    private readonly jwtService: JwtService,
    config: ConfigService,
  ) {
    const configuredStrategy = config.get('AUTH_STRATEGY', 'cookie');

    if (!AUTH_STRATEGIES.includes(configuredStrategy as AuthStrategy)) {
      throw new Error('AUTH_STRATEGY must be cookie, bearer, or both.');
    }

    this.strategy = configuredStrategy as AuthStrategy;

    this.accessTokenTtlMs =
      this.readPositiveInteger(
        config.get('AUTH_ACCESS_TOKEN_TTL_MINUTES'),
        15,
      ) * MINUTE_MS;

    this.refreshTokenTtlMs =
      this.readPositiveInteger(
        config.get('AUTH_REFRESH_TOKEN_TTL_DAYS'),
        7,
      ) * DAY_MS;

    this.cookieTtlMs =
      this.readPositiveInteger(
        config.get('AUTH_COOKIE_TTL_DAYS'),
        7,
      ) * MINUTE_MS;
      // DAY_MS;

    this.absoluteSessionTtlMs =
      this.readPositiveInteger(
        config.get('AUTH_SESSION_ABSOLUTE_TTL_DAYS'),
        30,
      ) * DAY_MS;
  }

  async onModuleInit(): Promise<void> {
    await this.markExpiredSessions();

    const now = new Date();

    const revokedSessions = await this.sessions.find({
      select: ['id', 'absoluteExpiresAt'],
      where: {
        revokedAt: Not(IsNull()),
        absoluteExpiresAt: MoreThan(now),
      },
    });

    for (const session of revokedSessions) {
      this.revokedSessions.set(
        session.id,
        session.absoluteExpiresAt.getTime(),
      );
    }

    this.expirySweep = setInterval(() => {
      void this.markExpiredSessions().catch((error: unknown) => {
        this.logger.error(
          'Failed to mark expired authentication sessions.',
          error instanceof Error ? error.stack : undefined,
        );
      });
    }, MINUTE_MS);

    this.expirySweep.unref();
  }

  onModuleDestroy(): void {
    if (this.expirySweep) {
      clearInterval(this.expirySweep);
    }
  }

  private async markExpiredSessions(): Promise<void> {
    const now = new Date();

    await this.sessions
      .createQueryBuilder()
      .update(AuthSession)
      .set({ revokedAt: now })
      .where('revoked_at IS NULL')
      .andWhere(
        '(refresh_expires_at <= :now OR absolute_expires_at <= :now)',
        { now },
      )
      .execute();
  }

  async login(
    usuario: string,
    password: string,
  ): Promise<AuthTokens> {
    const user = await this.users
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.usuario = :usuario', { usuario })
      .andWhere('user.activo = :activo', { activo: true })
      .getOne();

    if (!user || !(await compare(password, user.passwordHash))) {
      throw new UnauthorizedException(
        'Usuario o contraseña inválidos.',
      );
    }

    const now = new Date();

    const absoluteExpiresAt = new Date(
      now.getTime() + this.absoluteSessionTtlMs,
    );

    return this.sessions.manager.transaction(async (manager) => {
      const sessionRepository = manager.getRepository(AuthSession);

      const placeholder = randomBytes(32).toString('base64url');

      const session = await sessionRepository.save(
        sessionRepository.create({
          userId: user.id,
          tokenHash: this.hashToken(placeholder),
          expiresAt: absoluteExpiresAt,
          refreshTokenHash: this.hashToken(`${placeholder}:refresh`),
          refreshExpiresAt: this.expiryAfter(
            this.refreshTokenTtlMs,
            absoluteExpiresAt,
          ),
          absoluteExpiresAt,
          lastUsedAt: now,
        }),
      );

      const tokens = await this.createTokenPair(
        user,
        session.id,
        absoluteExpiresAt,
        [],
      );

      const result = await sessionRepository.update(session.id, {
        tokenHash: this.hashToken(tokens.accessToken),
        expiresAt: tokens.accessExpiresAt,
        refreshTokenHash: this.hashToken(tokens.refreshToken),
        refreshExpiresAt: tokens.refreshExpiresAt,
      });

      if (result.affected !== 1) {
        throw new Error(
          'Could not persist the new authentication session.',
        );
      }

      return tokens;
    });
  }

  async refresh(refreshToken?: string): Promise<AuthTokens> {
    if (!refreshToken) {
      throw new UnauthorizedException(
        'Refresh token ausente o inválido.',
      );
    }

    const claims = await this.verifyToken(
      refreshToken,
      'refresh',
    );

    const now = new Date();
    const currentHash = this.hashToken(refreshToken);

    const session = await this.sessions.findOne({
      where: {
        id: claims.sid,
        userId: Number(claims.sub),
        refreshTokenHash: currentHash,
        refreshExpiresAt: MoreThan(now),
        absoluteExpiresAt: MoreThan(now),
        revokedAt: IsNull(),
      },
    });

    if (!session?.absoluteExpiresAt) {
      throw new UnauthorizedException(
        'Refresh token expirado, revocado o reutilizado.',
      );
    }

    const user = await this.users.findOne({
      where: {
        id: session.userId,
        activo: true,
      },
    });

    if (!user) {
      await this.sessions.update(session.id, {
        revokedAt: now,
        lastUsedAt: now,
      });

      this.rememberRevokedSession(
        session.id,
        session.absoluteExpiresAt,
      );

      throw new UnauthorizedException(
        'Sesión ausente o inválida.',
      );
    }

    const tokens = await this.createTokenPair(
      user,
      session.id,
      session.absoluteExpiresAt,
      [],
    );

    const result = await this.sessions
      .createQueryBuilder()
      .update(AuthSession)
      .set({
        tokenHash: this.hashToken(tokens.accessToken),
        expiresAt: tokens.accessExpiresAt,
        refreshTokenHash: this.hashToken(tokens.refreshToken),
        refreshExpiresAt: tokens.refreshExpiresAt,
        lastUsedAt: now,
      })
      .where('id = :id', { id: session.id })
      .andWhere(
        'refresh_token_hash = :currentHash',
        { currentHash },
      )
      .andWhere('revoked_at IS NULL')
      .execute();

    if (result.affected !== 1) {
      throw new UnauthorizedException(
        'Refresh token expirado, revocado o reutilizado.',
      );
    }

    return tokens;
  }

  async renewCookieSession(
    accessToken?: string,
    refreshToken?: string,
  ): Promise<AuthTokens | null> {
    if (accessToken) {
      try {
        await this.verifyAccessToken(accessToken);
        return null;
      } catch (error) {
        if (!this.isAccessTokenExpired(error)) {
          throw error;
        }
      }
    }

    if (!refreshToken) {
      return null;
    }

    return this.refresh(refreshToken);
  }

  async getAuthenticatedUser(
    token?: string,
  ): Promise<AuthenticatedUser> {
    if (!token) {
      throw new UnauthorizedException(
        'Sesión ausente o inválida.',
      );
    }

    return this.verifyAccessToken(token);
  }

  async verifyAccessToken(
    token: string,
  ): Promise<AuthenticatedUser> {
    const claims = await this.verifyToken(token, 'access');

    if (this.isSessionRevoked(claims.sid)) {
      throw new UnauthorizedException('Sesión revocada.');
    }

    if (!claims.role || !claims.usuario || !claims.email) {
      throw new UnauthorizedException(
        'Access token inválido.',
      );
    }

    const permissions = Array.isArray(claims.permissions)
      ? claims.permissions.filter(
          (permission): permission is string =>
            typeof permission === 'string',
        )
      : [];

    return {
      id: Number(claims.sub),
      usuario: claims.usuario,
      email: claims.email,
      role: claims.role,
      permissions,
    };
  }

  isAccessTokenExpired(error: unknown): boolean {
    return error instanceof AccessTokenExpiredException;
  }

  async logout(
    accessToken?: string,
    refreshToken?: string,
  ): Promise<void> {
    const tokenHashes = [accessToken, refreshToken]
      .filter((token): token is string => Boolean(token))
      .map((token) => this.hashToken(token));

    if (tokenHashes.length === 0) {
      return;
    }

    const session = await this.sessions.findOne({
      where: [
        ...(accessToken
          ? [{ tokenHash: this.hashToken(accessToken) }]
          : []),
        ...(refreshToken
          ? [
              {
                refreshTokenHash:
                  this.hashToken(refreshToken),
              },
            ]
          : []),
      ],
    });

    if (!session) {
      return;
    }

    const now = new Date();

    const result = await this.sessions.update(
      {
        id: session.id,
        revokedAt: IsNull(),
      },
      {
        revokedAt: now,
        lastUsedAt: now,
      },
    );

    if (result.affected === 1) {
      this.rememberRevokedSession(
        session.id,
        session.absoluteExpiresAt,
      );
    }
  }

  private isSessionRevoked(sessionId: number): boolean {
    const expiresAt = this.revokedSessions.get(sessionId);

    if (expiresAt === undefined) {
      return false;
    }

    if (expiresAt > Date.now()) {
      return true;
    }

    this.revokedSessions.delete(sessionId);

    return false;
  }

  private rememberRevokedSession(
    sessionId: number,
    absoluteExpiresAt: Date,
  ): void {
    if (absoluteExpiresAt.getTime() > Date.now()) {
      this.revokedSessions.set(
        sessionId,
        absoluteExpiresAt.getTime(),
      );
    }
  }

  private async createTokenPair(
    user: User,
    sessionId: number,
    absoluteExpiresAt: Date,
    permissions: string[],
  ): Promise<AuthTokens> {
    const now = Date.now();

    const accessExpiresAt = this.expiryAfter(
      this.accessTokenTtlMs,
      absoluteExpiresAt,
    );

    const refreshExpiresAt = this.expiryAfter(
      this.refreshTokenTtlMs,
      absoluteExpiresAt,
    );

    const accessToken = await this.jwtService.signAsync(
      {
        sub: String(user.id),
        sid: sessionId,
        typ: 'access',
        jti: randomUUID(),
        role: user.role,
        permissions,
        usuario: user.usuario,
        email: user.email,
      },
      {
        expiresIn: Math.max(
          1,
          Math.floor(
            (accessExpiresAt.getTime() - now) / 1000,
          ),
        ),
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      {
        sub: String(user.id),
        sid: sessionId,
        typ: 'refresh',
        jti: randomUUID(),
      },
      {
        expiresIn: Math.max(
          1,
          Math.floor(
            (refreshExpiresAt.getTime() - now) / 1000,
          ),
        ),
      },
    );

    return {
      accessToken,
      refreshToken,
      accessExpiresAt,
      refreshExpiresAt,
      user: {
        ...this.toAuthenticatedUser(user),
        permissions,
      },
    };
  }

  private async verifyToken(
    token: string,
    expectedType: SessionJwtClaims['typ'],
  ): Promise<SessionJwtClaims> {
    let claims: SessionJwtClaims;

    try {
      claims =
        await this.jwtService.verifyAsync<SessionJwtClaims>(
          token,
        );
    } catch (error) {
      if (
        expectedType === 'access' &&
        error instanceof Error &&
        error.name === 'TokenExpiredError'
      ) {
        throw new AccessTokenExpiredException();
      }

      throw new UnauthorizedException(
        'Token ausente, inválido o vencido.',
      );
    }

    if (
      claims.typ !== expectedType ||
      !claims.sub ||
      !Number.isSafeInteger(claims.sid) ||
      !claims.jti
    ) {
      throw new UnauthorizedException(
        'Token inválido.',
      );
    }

    return claims;
  }

  private expiryAfter(
    durationMs: number,
    absoluteExpiresAt: Date,
  ): Date {
    return new Date(
      Math.min(
        Date.now() + durationMs,
        absoluteExpiresAt.getTime(),
      ),
    );
  }

  private hashToken(token: string): string {
    return createHash('sha256')
      .update(token)
      .digest('hex');
  }

  private readPositiveInteger(
    value: string | undefined,
    fallback: number,
  ): number {
    if (value === undefined) {
      return fallback;
    }

    const parsed = Number(value);

    if (!Number.isSafeInteger(parsed) || parsed <= 0) {
      throw new Error(
        'Authentication token durations must be positive integers.',
      );
    }

    return parsed;
  }

  private toAuthenticatedUser(
    user: User,
  ): AuthenticatedUser {
    return {
      id: user.id,
      usuario: user.usuario,
      email: user.email,
      role: user.role,
      permissions: [],
    };
  }
}