import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HomeStatisticsService } from './home-statistics.service';

@ApiTags('Inicio')
@Controller('home/stats')
export class HomeStatisticsController {
  constructor(private readonly statistics: HomeStatisticsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar estadísticas activas del inicio' })
  findAll() {
    return this.statistics.findPublic();
  }
}
