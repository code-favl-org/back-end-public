import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BaseCrudController } from '../../common/controllers/base-crud.controller';
import { Event } from './entities/event.entity';
import { EventsService } from './events.service';

@ApiTags('Eventos')
@Controller('novedades/eventos')
export class EventsController extends BaseCrudController<Event> {
  constructor(private readonly events: EventsService) {
    super(events);
  }

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
}
