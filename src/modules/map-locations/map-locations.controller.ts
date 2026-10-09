import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BaseCrudController } from '../../common/controllers/base-crud.controller';
import { MapLocation } from './entities/map-location.entity';
import { MapLocationsService } from './map-locations.service';

@ApiTags('Mapa')
@Controller('sitios')
export class MapLocationsController extends BaseCrudController<MapLocation> {
  constructor(private readonly locations: MapLocationsService) {
    super(locations);
  }

  @Get()
  @ApiOperation({ summary: 'Listar sitios, clubes y escuelas del mapa' })
  @ApiQuery({ name: 'modalidad', required: false })
  @ApiQuery({
    name: 'tipo',
    required: false,
    enum: ['sitio', 'club', 'escuela'],
  })
  findAll(
    @Query('modalidad') modalidad?: string,
    @Query('tipo') tipo?: string,
  ) {
    return this.locations.findPublic({ modalidad, tipo });
  }
}
