import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

const userPersistence =
  process.env.NODE_ENV === 'test'
    ? []
    : [TypeOrmModule.forFeature([User])];

const userProviders =
  process.env.NODE_ENV === 'test'
    ? [{ provide: UsersService, useValue: {} }]
    : [UsersService];

@Module({
  imports: userPersistence,
  controllers: [UsersController],
  providers: userProviders,
  exports: [UsersService],
})
export class UsersModule {}