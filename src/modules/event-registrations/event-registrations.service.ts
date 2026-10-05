import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseCrudService } from '../../common/database/base-crud.service';
import { EventRegistration } from './entities/event-registration.entity';

@Injectable()
export class EventRegistrationsService extends BaseCrudService<EventRegistration> {
  constructor(@InjectRepository(EventRegistration) repository: Repository<EventRegistration>) {
    super(repository);
  }
}
