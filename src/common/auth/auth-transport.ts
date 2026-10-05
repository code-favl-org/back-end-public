import { BadRequestException } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthStrategy } from '../../modules/auth/auth.service';

const AUTH_TRANSPORTS = new Set<AuthStrategy>(['cookie', 'bearer', 'both']);

export function resolveAuthTransport(
  request: Request,
  configuredStrategy: AuthStrategy,
  hasRefreshTokenBody = false,
): AuthStrategy {
  if (configuredStrategy !== 'both') return configuredStrategy;

  const header = request.headers['x-auth-transport'];
  const requested = Array.isArray(header)
    ? header[0]?.toLowerCase()
    : header?.toLowerCase();

  if (requested) {
    if (!AUTH_TRANSPORTS.has(requested as AuthStrategy)) {
      throw new BadRequestException(
        'X-Auth-Transport must be cookie, bearer, or both.',
      );
    }
    return requested as AuthStrategy;
  }

  if (request.headers.authorization || hasRefreshTokenBody) return 'bearer';
  return 'cookie';
}

export function getBearerToken(request: Request): string | undefined {
  return request.headers.authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
}

export function getAccessToken(
  request: Request,
  transport: AuthStrategy,
): string | undefined {
  const bearerToken = getBearerToken(request);
  if (transport === 'cookie') return request.cookies?.favl_access;
  if (transport === 'bearer') return bearerToken;
  return bearerToken ?? request.cookies?.favl_access;
}