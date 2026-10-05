import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BaseCrudController } from '../../common/controllers/base-crud.controller';
import { PermissionResource } from '../../common/decorators/permissions.decorator';
import { EventRegistration } from './entities/event-registration.entity';
import { EventRegistrationsService } from './event-registrations.service';

@ApiTags('Event registrations')
@PermissionResource('event_registrations')
@Controller('event-registrations')
export class EventRegistrationsController extends BaseCrudController<EventRegistration> {
  constructor(service: EventRegistrationsService) {
    super(service);
  }
}
