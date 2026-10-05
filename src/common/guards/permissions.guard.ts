import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuthenticatedRequest } from '../auth/authenticated-request';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import {
  PERMISSIONS_KEY,
  PERMISSION_RESOURCE_KEY,
} from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const handler = context.getHandler();
    const controller = context.getClass();
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      handler,
      controller,
    ]);
    if (isPublic) return true;

    const explicitPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [handler, controller],
    );
    const resource = this.reflector.getAllAndOverride<string>(
      PERMISSION_RESOURCE_KEY,
      [handler, controller],
    );
    if (!explicitPermissions?.length && !resource) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.authUser;
    if (!user) throw new UnauthorizedException('Sesión ausente o inválida.');

    const required =
      explicitPermissions?.length
        ? explicitPermissions
        : [`${resource}.${this.actionFor(request.method)}`];
    const granted = new Set(user.permissions ?? []);
    if (granted.has('*') || required.every((permission) => granted.has(permission))) {
      return true;
    }
    throw new ForbiddenException('No tienes los permisos requeridos.');
  }

  private actionFor(method: string): string {
    const actions: Record<string, string> = {
      GET: 'read',
      POST: 'create',
      PUT: 'update',
      PATCH: 'update',
      DELETE: 'delete',
    };
    const action = actions[method.toUpperCase()];
    if (!action) throw new ForbiddenException('No hay permiso para este método HTTP.');
    return action;
  }
}