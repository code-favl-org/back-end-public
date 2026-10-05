import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import {
  PERMISSIONS_KEY,
  PERMISSION_RESOURCE_KEY,
} from '../decorators/permissions.decorator';

describe('PermissionsGuard', () => {
  const handler = jest.fn();
  const controller = jest.fn();
  let metadata: Record<string, unknown>;
  let request: { method: string; authUser?: { permissions: string[] } };
  let guard: PermissionsGuard;

  beforeEach(() => {
    metadata = {};
    request = { method: 'GET', authUser: { permissions: [] } };
    const reflector = {
      getAllAndOverride: jest.fn((key: string) => metadata[key]),
    } as unknown as Reflector;
    guard = new PermissionsGuard(reflector);
  });

  const context = (): ExecutionContext =>
    ({
      getHandler: () => handler,
      getClass: () => controller,
      switchToHttp: () => ({ getRequest: () => request }),
    }) as unknown as ExecutionContext;

  it('allows a public handler without checking permissions', () => {
    metadata[IS_PUBLIC_KEY] = true;
    metadata[PERMISSION_RESOURCE_KEY] = 'clubs';

    expect(guard.canActivate(context())).toBe(true);
  });

  it('requires the resource action permission', () => {
    metadata[PERMISSION_RESOURCE_KEY] = 'clubs';

    expect(() => guard.canActivate(context())).toThrow(ForbiddenException);
  });

  it('allows a user with the matching resource action permission', () => {
    metadata[PERMISSION_RESOURCE_KEY] = 'clubs';
    request.authUser = { permissions: ['clubs.read'] };

    expect(guard.canActivate(context())).toBe(true);
  });

  it('requires every explicitly declared permission', () => {
    metadata[PERMISSIONS_KEY] = ['clubs.read', 'clubs.export'];
    request.authUser = { permissions: ['clubs.read'] };

    expect(() => guard.canActivate(context())).toThrow(ForbiddenException);
  });
});