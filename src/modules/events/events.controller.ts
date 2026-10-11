import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { EventsService } from './events.service';

@ApiTags('Eventos')
@Controller('novedades/eventos')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar eventos con filtros opcionales' })
  @ApiQuery({ name: 'modalidad', required: false })
  @ApiQuery({ name: 'estado', required: false })
  findAll(
    @Query('modalidad') modalidad?: string,
    @Query('estado') estado?: string,
  ) {
    return this.events.findPublic({ modalidad, estado });
  }

  @Get(':identifier')
  @ApiOperation({ summary: 'Obtener evento público por slug o ID' })
  findPublicByIdentifier(@Param('identifier') identifier: string) {
    return this.events.findPublicByIdentifier(identifier);
  }
}
