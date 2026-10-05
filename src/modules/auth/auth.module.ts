import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthSession } from './entities/auth-session.entity';
import { User } from '../users/entities/user.entity';


const authImports =
	process.env.NODE_ENV === 'test'
		? []
		: [TypeOrmModule.forFeature([User, AuthSession])];

const authProviders =
	process.env.NODE_ENV === 'test'
		? [{ provide: AuthService, useValue: {} as AuthService }]
		: [AuthService];

const jwtModule = JwtModule.registerAsync({
	imports: [ConfigModule],
	inject: [ConfigService],
	useFactory: (config: ConfigService) => {
		const secret = config.get<string>('AUTH_JWT_SECRET');
		if (!secret && process.env.NODE_ENV !== 'test') {
			throw new Error('AUTH_JWT_SECRET is required outside test.');
		}
		if (secret && Buffer.byteLength(secret) < 32) {
			throw new Error('AUTH_JWT_SECRET must contain at least 32 bytes.');
		}
		return {
			secret: secret ?? 'test-only-secret-not-for-real-signing',
			signOptions: {
				algorithm: 'HS256' as const,
				issuer: 'favl-api',
				audience: 'favl-api',
			},
			verifyOptions: {
				algorithms: ['HS256'] as const,
				issuer: 'favl-api',
				audience: 'favl-api',
			},
		};
	},
});

@Module({
	imports: [...authImports, jwtModule],
	controllers: [AuthController],
	providers: [
		...authProviders,
		{ provide: APP_GUARD, useClass: AuthGuard },
		{ provide: APP_GUARD, useClass: PermissionsGuard },
		{ provide: APP_GUARD, useClass: RolesGuard },
	],
	exports: [AuthService],
})
export class AuthModule {}