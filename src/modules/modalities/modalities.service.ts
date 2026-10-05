import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseCrudService } from '../../common/database/base-crud.service';
import { Modality } from './entities/modality.entity';

@Injectable()
export class ModalitiesService extends BaseCrudService<Modality> {
  constructor(@InjectRepository(Modality) repository: Repository<Modality>) {
    super(repository);
  }

  findPublic() {
    return this.repository.find({ where: { active: true }, order: { name: 'ASC' } });
  }
}
