import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LicensesService } from './licenses.service';

@ApiTags('Licencias')
@Controller('licencias')
export class LicensesController {
  constructor(private readonly licenses: LicensesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar licencias' })
  findAll() {
    return this.licenses.findPublic();
  }
}
