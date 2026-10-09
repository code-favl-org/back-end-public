import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseCrudController } from '../../common/controllers/base-crud.controller';
import { Modality } from './entities/modality.entity';
import { ModalitiesService } from './modalities.service';

@ApiTags('Modalidades')
@Controller('modalidades')
export class ModalitiesController extends BaseCrudController<Modality> {
  constructor(private readonly modalities: ModalitiesService) {
    super(modalities);
  }

  @Get()
  @ApiOperation({ summary: 'Listar modalidades activas' })
  findAll() {
    return this.modalities.findPublic();
  }
}
