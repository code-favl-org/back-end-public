import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { MapLocationsService } from './map-locations.service';

@ApiTags('Mapa')
@Controller('sitios')
export class MapLocationsController {
  constructor(private readonly locations: MapLocationsService) {}

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
