import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseCrudController } from '../../common/controllers/base-crud.controller';
import { License } from './entities/license.entity';
import { LicensesService } from './licenses.service';

@ApiTags('Licencias')
@Controller('licencias')
export class LicensesController extends BaseCrudController<License> {
  constructor(private readonly licenses: LicensesService) {
    super(licenses);
  }

  @Get()
  @ApiOperation({ summary: 'Listar licencias' })
  findAll() {
    return this.licenses.findPublic();
  }
}
