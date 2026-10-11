import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventRegistration } from './entities/event-registration.entity';
import { EventRegistrationsService } from './event-registrations.service';

const persistence =
  process.env.NODE_ENV === 'test'
    ? []
    : [TypeOrmModule.forFeature([EventRegistration])];
const providers =
  process.env.NODE_ENV === 'test'
    ? [{ provide: EventRegistrationsService, useValue: {} }]
    : [EventRegistrationsService];

@Module({
  imports: persistence,
  controllers: [],
  providers,
  exports: [EventRegistrationsService],
})
export class EventRegistrationsModule {}
