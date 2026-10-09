import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseCrudController } from '../../common/controllers/base-crud.controller';
import { EventRegistration } from './entities/event-registration.entity';
import { EventRegistrationsService } from './event-registrations.service';

@ApiTags('Event registrations')
@Controller('event-registrations')
export class EventRegistrationsController extends BaseCrudController<EventRegistration> {
  constructor(service: EventRegistrationsService) {
    super(service);
  }
}
