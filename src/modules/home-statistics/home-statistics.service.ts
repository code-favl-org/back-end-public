import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseCrudService } from '../../common/database/base-crud.service';
import { HomeStatistic } from './entities/home-statistic.entity';

@Injectable()
export class HomeStatisticsService extends BaseCrudService<HomeStatistic> {
  constructor(@InjectRepository(HomeStatistic) repository: Repository<HomeStatistic>) {
    super(repository);
  }

  async findPublic() {
    const statistics = await this.repository.find({
      where: { isActive: true },
      order: { sortOrder: 'ASC', id: 'ASC' },
    });
    return statistics.map((statistic) => ({
      id: Number(statistic.id),
      num: statistic.value,
      label: statistic.label,
    }));
  }
}
