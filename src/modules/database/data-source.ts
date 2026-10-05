import { existsSync } from 'node:fs';
import { DataSource } from 'typeorm';
import { AuthSession } from '../auth/entities/auth-session.entity';
import { User } from '../users/entities/user.entity';
import { AddDomainPrimaryKeys2026100100000 } from './migrations/2026100100000-add-domain-primary-keys';
import { AddAuthSessionHistory2026093015000 } from './migrations/2026093015000-add-auth-session-history';
import { AddAbsoluteAuthExpiry2026093014000 } from './migrations/2026093014000-add-absolute-auth-expiry';
import { AddRefreshToAuthSessions2026093013000 } from './migrations/2026093013000-add-refresh-to-auth-sessions';
import { CreateAuthSessions2026093012000 } from './migrations/2026093012000-create-auth-sessions';
import { CreateUsersTable2026093000000 } from './migrations/2026093000000-create-users';

if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export default new DataSource({
  type: 'mariadb',
  host: required('DB_HOST'),
  port: Number(process.env.DB_PORT ?? 3306),
  username: required('DB_USERNAME'),
  password: required('DB_PASSWORD'),
  database: required('DB_NAME'),
  entities: [User, AuthSession],
  migrations: [
    CreateUsersTable2026093000000,
    CreateAuthSessions2026093012000,
    AddRefreshToAuthSessions2026093013000,
    AddAbsoluteAuthExpiry2026093014000,
    AddAuthSessionHistory2026093015000,
    AddDomainPrimaryKeys2026100100000,
  ],
  synchronize: false,
});