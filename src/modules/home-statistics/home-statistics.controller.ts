import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseCrudController } from '../../common/controllers/base-crud.controller';
import { HomeStatistic } from './entities/home-statistic.entity';
import { HomeStatisticsService } from './home-statistics.service';

@ApiTags('Inicio')
@Controller('home/stats')
export class HomeStatisticsController extends BaseCrudController<HomeStatistic> {
  constructor(private readonly statistics: HomeStatisticsService) {
    super(statistics);
  }

  @Get()
  @ApiOperation({ summary: 'Listar estadísticas activas del inicio' })
  findAll() {
    return this.statistics.findPublic();
  }
}
