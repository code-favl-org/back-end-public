import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { PermissionsService } from './permissions.service';

const persistence =
  process.env.NODE_ENV === 'test'
    ? []
    : [TypeOrmModule.forFeature([Permission])];
const providers =
  process.env.NODE_ENV === 'test'
    ? [{ provide: PermissionsService, useValue: {} }]
    : [PermissionsService];

@Module({
  imports: persistence,
  controllers: [],
  providers,
  exports: [PermissionsService],
})
export class PermissionsModule {}
