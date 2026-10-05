import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddDomainPrimaryKeys2026100100000 } from './migrations/2026100100000-add-domain-primary-keys';
import { AddAuthSessionHistory2026093015000 } from './migrations/2026093015000-add-auth-session-history';
import { AddAbsoluteAuthExpiry2026093014000 } from './migrations/2026093014000-add-absolute-auth-expiry';
import { AddRefreshToAuthSessions2026093013000 } from './migrations/2026093013000-add-refresh-to-auth-sessions';
import { CreateAuthSessions2026093012000 } from './migrations/2026093012000-create-auth-sessions';
import { CreateUsersTable2026093000000 } from './migrations/2026093000000-create-users';

const databaseImports =
  process.env.NODE_ENV === 'test'
    ? []
    : [
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (config: ConfigService) => ({
            type: 'mariadb' as const,
            host: config.getOrThrow<string>('DB_HOST'),
            port: config.get<number>('DB_PORT', 3306),
            username: config.getOrThrow<string>('DB_USERNAME'),
            password: config.getOrThrow<string>('DB_PASSWORD'),
            database: config.getOrThrow<string>('DB_NAME'),
            autoLoadEntities: true,
            migrations: [
              CreateUsersTable2026093000000,
              CreateAuthSessions2026093012000,
              AddRefreshToAuthSessions2026093013000,
              AddAbsoluteAuthExpiry2026093014000,
              AddAuthSessionHistory2026093015000,
              AddDomainPrimaryKeys2026100100000,
            ],
            migrationsRun: false,
            synchronize: false,
          }),
        }),
      ];

@Module({ imports: databaseImports })
export class DatabaseModule {}