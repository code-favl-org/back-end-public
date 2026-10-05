import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PermissionResource } from '../../common/decorators/permissions.decorator';
import { BaseCrudController } from '../../common/controllers/base-crud.controller';
import { Modality } from './entities/modality.entity';
import { ModalitiesService } from './modalities.service';

@ApiTags('Modalidades')
@PermissionResource('modalities')
@Controller('modalidades')
export class ModalitiesController extends BaseCrudController<Modality> {
  constructor(private readonly modalities: ModalitiesService) {
    super(modalities);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar modalidades activas' })
  findAll() {
    return this.modalities.findPublic();
  }
}
