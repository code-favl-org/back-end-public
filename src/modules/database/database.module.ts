import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

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
            synchronize: false,
          }),
        }),
      ];

@Module({ imports: databaseImports })
export class DatabaseModule {}
