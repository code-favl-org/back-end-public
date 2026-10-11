import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ModalitiesService } from './modalities.service';

@ApiTags('Modalidades')
@Controller('modalidades')
export class ModalitiesController {
  constructor(private readonly modalities: ModalitiesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar modalidades activas' })
  findAll() {
    return this.modalities.findPublic();
  }
}
