import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PermissionResource } from '../../common/decorators/permissions.decorator';
import { BaseCrudController } from '../../common/controllers/base-crud.controller';
import { License } from './entities/license.entity';
import { LicensesService } from './licenses.service';

@ApiTags('Licencias')
@PermissionResource('licenses')
@Controller('licencias')
export class LicensesController extends BaseCrudController<License> {
  constructor(private readonly licenses: LicensesService) {
    super(licenses);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar licencias' })
  findAll() {
    return this.licenses.findPublic();
  }
}
