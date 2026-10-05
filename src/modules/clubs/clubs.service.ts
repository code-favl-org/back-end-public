import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseCrudService } from '../../common/database/base-crud.service';
import { Club } from './entities/club.entity';

@Injectable()
export class ClubsService extends BaseCrudService<Club> {
  constructor(@InjectRepository(Club) repository: Repository<Club>) {
    super(repository);
  }

  findPublic() {
    return this.repository.find({
      where: { active: true },
      order: { name: 'ASC', id: 'ASC' },
    });
  }
}
