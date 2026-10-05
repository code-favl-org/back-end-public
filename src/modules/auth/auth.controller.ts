import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotImplementedException,
  Post,
  Body,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBody,
  ApiBearerAuth,
  ApiCookieAuth,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthUser } from '../../common/auth/auth-user.decorator';
import {
  getAccessToken as extractAccessToken,
  resolveAuthTransport,
} from '../../common/auth/auth-transport';
import { Public } from '../../common/decorators/public.decorator';
import {
  ForgotPasswordDto,
  LoginDto,
  RefreshSessionDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { AuthService } from './auth.service';
import type { AuthenticatedUser } from './auth.service';
import type { CookieOptions, Request, Response } from 'express';

const DEFAULT_ACCESS_COOKIE = 'favl_access';
const DEFAULT_REFRESH_COOKIE = 'favl_refresh';
const DEFAULT_ADMIN_COOKIE = 'ADMIN_COOKIE';
const DEFAULT_ACCESS_COOKIE_PATH = '/api';
const DEFAULT_REFRESH_COOKIE_PATH = '/api';
const DEFAULT_ADMIN_COOKIE_PATH = '/admin';
const DEFAULT_ADMIN_COOKIE_ROLES = 'admin,superadmin';

@ApiTags('Autenticación')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  private get accessCookie(): string {
    return this.config.get<string>('ACCESS_COOKIE', DEFAULT_ACCESS_COOKIE);
  }

  private get refreshCookie(): string {
    return this.config.get<string>('REFRESH_COOKIE', DEFAULT_REFRESH_COOKIE);
  }

  private get adminCookie(): string {
    return this.config.get<string>('ADMIN_COOKIE', DEFAULT_ADMIN_COOKIE);
  }

  private get accessCookiePath(): string {
    return this.config.get<string>('ACCESS_COOKIE_PATH', DEFAULT_ACCESS_COOKIE_PATH);
  }

  private get refreshCookiePath(): string {
    return this.config.get<string>('REFRESH_COOKIE_PATH', DEFAULT_REFRESH_COOKIE_PATH);
  }

  private get adminCookiePath(): string {
    return this.config.get<string>('ADMIN_COOKIE_PATH', DEFAULT_ADMIN_COOKIE_PATH);
  }

  private get adminCookieRoles(): Set<string> {
    return new Set(
      (this.config.get<string>('ADMIN_COOKIE_ROLES', DEFAULT_ADMIN_COOKIE_ROLES) ?? '')
        .split(',')
        .map((role) => role.trim().toLowerCase())
        .filter(Boolean),
    );
  }

  private get baseCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.config.get<string>('NODE_ENV') === 'production',
      sameSite: 'lax',
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ type: LoginDto })
  @ApiHeader({
    name: 'X-Auth-Transport',
    enum: ['cookie', 'bearer', 'both'],
    required: false,
    description: 'Solo para AUTH_STRATEGY=both. Sin header se usa cookie.',
  })
  @ApiResponse({ status: 200, description: 'Sesión iniciada según AUTH_STRATEGY.' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas.' })
  async login(
    @Body() body: LoginDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const session = await this.authService.login(body.usuario, body.password);
    return this.presentTokens(response, session, this.getTransport(request));
  }

  @Get('me')
  @ApiOperation({ summary: 'Obtener la sesión actual' })
  @ApiCookieAuth('session-cookie')
  @ApiBearerAuth('session-bearer')
  @ApiHeader({ name: 'X-Auth-Transport', enum: ['cookie', 'bearer', 'both'], required: false })
  @ApiResponse({ status: 200, description: 'Usuario y rol de la sesión.' })
  @ApiResponse({ status: 401, description: 'Sesión ausente o inválida.' })
  me(@AuthUser() user: AuthenticatedUser) {
    return user;
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cerrar sesión' })
  @ApiCookieAuth('session-cookie')
  @ApiCookieAuth('refresh-cookie')
  @ApiBearerAuth('session-bearer')
  @ApiResponse({ status: 204, description: 'Sesión invalidada.' })
  async logout(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<void> {
    const transport = this.getTransport(request);
    await this.authService.logout(
      this.getAccessToken(request, transport),
      transport === 'cookie'
        ? request.cookies?.[this.refreshCookie]
        : undefined,
    );
    this.clearCookies(response, transport);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar la sesión' })
  @ApiCookieAuth('session-cookie')
  @ApiCookieAuth('refresh-cookie')
  @ApiBearerAuth('session-bearer')
  @ApiBody({ type: RefreshSessionDto, required: false })
  @ApiResponse({ status: 200, description: 'Refresh en cookie para web o en body para Bearer; devuelve el par rotado.' })
  @ApiResponse({ status: 401, description: 'Sesión de renovación inválida o expirada.' })
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Body() body?: RefreshSessionDto,
  ) {
    const transport = this.getTransport(request, body);
    const refreshToken =
      transport === 'cookie'
        ? request.cookies?.[this.refreshCookie]
        : body?.refreshToken ?? request.cookies?.[this.refreshCookie];
    const tokens = await this.authService.refresh(refreshToken);
    return this.presentTokens(response, tokens, transport);
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Solicitar recuperación de contraseña' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({ status: 202, description: 'Solicitud recibida.' })
  @ApiResponse({ status: 501, description: 'Recuperación pendiente de implementar.' })
  forgotPassword(@Body() _body: ForgotPasswordDto): never {
    throw new NotImplementedException();
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Restablecer contraseña' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({ status: 204, description: 'Contraseña restablecida.' })
  @ApiResponse({ status: 400, description: 'Token inválido, vencido o ya utilizado.' })
  @ApiResponse({ status: 501, description: 'Recuperación pendiente de implementar.' })
  resetPassword(@Body() _body: ResetPasswordDto): never {
    throw new NotImplementedException();
  }

  private getTransport(
    request: Request,
    body?: RefreshSessionDto,
  ) {
    return resolveAuthTransport(
      request,
      this.authService.strategy,
      Boolean(body?.refreshToken),
    );
  }

  private getAccessToken(
    request: Request,
    transport: ReturnType<typeof resolveAuthTransport>,
  ): string | undefined {
    return extractAccessToken(request, transport);
  }

  private presentTokens(
    response: Response,
    tokens: Awaited<ReturnType<AuthService['login']>>,
    transport: ReturnType<typeof resolveAuthTransport>,
  ) {
    const usesCookies = transport !== 'bearer';
    const usesBearer = transport !== 'cookie';
    const adminCookieMaxAge = Math.max(
      0,
      Math.min(
        this.authService.cookieTtlMs,
        tokens.refreshExpiresAt.getTime() - Date.now(),
      ),
    );

    if (usesCookies) {
      response.cookie(this.accessCookie, tokens.accessToken, {
        ...this.baseCookieOptions,
        path: this.accessCookiePath,
        maxAge: adminCookieMaxAge,
      });
      response.cookie(this.refreshCookie, tokens.refreshToken, {
        ...this.baseCookieOptions,
        path: this.refreshCookiePath,
        maxAge: adminCookieMaxAge,
      });
    }

    if (this.shouldSetAdminCookie(tokens.user.role)) {
      response.cookie(this.adminCookie, tokens.user.role, {
        ...this.baseCookieOptions,
        path: this.adminCookiePath,
        maxAge: adminCookieMaxAge,
      });
    }

    if (usesBearer) {
      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        accessExpiresAt: tokens.accessExpiresAt,
        refreshExpiresAt: tokens.refreshExpiresAt,
        user: tokens.user,
      };
    }

    return { user: tokens.user };
  }

  private clearCookies(
    response: Response,
    transport: ReturnType<typeof resolveAuthTransport>,
  ): void {
    if (transport !== 'bearer') {
      response.clearCookie(this.accessCookie, {
        ...this.baseCookieOptions,
        path: this.accessCookiePath,
      });
      response.clearCookie(this.refreshCookie, {
        ...this.baseCookieOptions,
        path: this.refreshCookiePath,
      });
    }

    response.clearCookie(this.adminCookie, {
      ...this.baseCookieOptions,
      path: this.adminCookiePath,
    });
  }

  private shouldSetAdminCookie(role?: string): boolean {
    if (!role) return false;
    return this.adminCookieRoles.has(role.trim().toLowerCase());
  }
}