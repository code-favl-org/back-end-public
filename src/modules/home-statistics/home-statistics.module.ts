import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeStatistic } from './entities/home-statistic.entity';
import { HomeStatisticsService } from './home-statistics.service';
import { HomeStatisticsController } from './home-statistics.controller';

const persistence = process.env.NODE_ENV === 'test' ? [] : [TypeOrmModule.forFeature([HomeStatistic])];
const providers = process.env.NODE_ENV === 'test' ? [{ provide: HomeStatisticsService, useValue: {} }] : [HomeStatisticsService];

@Module({ imports: persistence, controllers: [HomeStatisticsController], providers, exports: [HomeStatisticsService] })
export class HomeStatisticsModule {}
