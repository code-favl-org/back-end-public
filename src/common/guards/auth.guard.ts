import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../../modules/auth/auth.service';
import { getAccessToken, resolveAuthTransport } from '../auth/auth-transport';
import type { AuthenticatedRequest } from '../auth/authenticated-request';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const transport = resolveAuthTransport(
      request,
      this.authService.strategy ?? 'cookie',
    );
    const accessToken = getAccessToken(request, transport);
    if (!accessToken) {
      throw new UnauthorizedException('Sesión ausente o inválida.');
    }

    request.authUser = await this.authService.getAuthenticatedUser(accessToken);
    return true;
  }
}