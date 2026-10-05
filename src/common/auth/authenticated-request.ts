import type { Request } from 'express';
import type { AuthenticatedUser } from '../../modules/auth/auth.service';

export type AuthenticatedRequest = Request & {
  authUser?: AuthenticatedUser;
};