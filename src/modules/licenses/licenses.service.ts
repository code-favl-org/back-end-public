import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseCrudService } from '../../common/database/base-crud.service';
import { License } from './entities/license.entity';

@Injectable()
export class LicensesService extends BaseCrudService<License> {
  constructor(@InjectRepository(License) repository: Repository<License>) {
    super(repository);
  }

  findPublic() {
    return this.repository.find({ order: { id: 'ASC' } });
  }
}
