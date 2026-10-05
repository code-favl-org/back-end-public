import type { CookieOptions, RequestHandler } from 'express';
import { AuthService } from './auth.service';

const ACCESS_COOKIE = 'favl_access';
const REFRESH_COOKIE = 'favl_refresh';
const COOKIE_TTL_MS = Number(process.env.AUTH_COOKIE_TTL_DAYS ?? 7) * 24 * 60 * 60 * 1000;
const COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/api',
};
const SKIP_AUTO_RENEW = new Set([
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/refresh',
]);

export function createCookieSessionMiddleware(
  authService: AuthService,
): RequestHandler {
  return (request, response, next) => {
    const requestedTransport = request.headers['x-auth-transport'];
    const selectedTransport = Array.isArray(requestedTransport)
      ? requestedTransport[0]?.toLowerCase()
      : requestedTransport?.toLowerCase();
    const usesBearerHeader = /^Bearer\s+/i.test(
      request.headers.authorization ?? '',
    );
    if (
      authService.strategy === 'bearer' ||
      (authService.strategy === 'both' &&
        (usesBearerHeader || selectedTransport === 'bearer')) ||
      SKIP_AUTO_RENEW.has(request.path)
    ) {
      next();
      return;
    }

    const accessToken = request.cookies?.[ACCESS_COOKIE] as string | undefined;
    const refreshToken = request.cookies?.[REFRESH_COOKIE] as string | undefined;
    if (!refreshToken) {
      next();
      return;
    }

    void (async () => {
      if (accessToken) {
        try {
          await authService.verifyAccessToken(accessToken);
          response.cookie(ACCESS_COOKIE, accessToken, {
            ...COOKIE_OPTIONS,
            maxAge: COOKIE_TTL_MS,
          });
          next();
          return;
        } catch (error) {
          if (!authService.isAccessTokenExpired(error)) {
            next();
            return;
          }
        }
      }

      const tokens = await authService.renewCookieSession(undefined, refreshToken);
      if (tokens) {
        request.cookies = {
          ...request.cookies,
          [ACCESS_COOKIE]: tokens.accessToken,
          [REFRESH_COOKIE]: tokens.refreshToken,
        };
        const cookieMaxAge = Math.max(
          0,
          Math.min(COOKIE_TTL_MS, tokens.refreshExpiresAt.getTime() - Date.now()),
        );
        response.cookie(ACCESS_COOKIE, tokens.accessToken, {
          ...COOKIE_OPTIONS,
          maxAge: cookieMaxAge,
        });
        response.cookie(REFRESH_COOKIE, tokens.refreshToken, {
          ...COOKIE_OPTIONS,
          maxAge: cookieMaxAge,
        });
      }
      next();
    })().catch(next);
  };
}