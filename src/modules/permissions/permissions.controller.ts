import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseCrudController } from '../../common/controllers/base-crud.controller';
import { PermissionResource } from '../../common/decorators/permissions.decorator';
import { Permission } from './entities/permission.entity';
import { PermissionsService } from './permissions.service';

@ApiTags('Permissions')
@PermissionResource('permissions')
@Controller('permissions')
export class PermissionsController extends BaseCrudController<Permission> {
  constructor(service: PermissionsService) {
    super(service);
  }
}
