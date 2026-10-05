import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'requiredPermissions';
export const PERMISSION_RESOURCE_KEY = 'permissionResource';

export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

export const PermissionResource = (resource: string) =>
  SetMetadata(PERMISSION_RESOURCE_KEY, resource);