import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventRegistration } from './entities/event-registration.entity';
import { EventRegistrationsService } from './event-registrations.service';
import { EventRegistrationsController } from './event-registrations.controller';

const persistence = process.env.NODE_ENV === 'test' ? [] : [TypeOrmModule.forFeature([EventRegistration])];
const providers = process.env.NODE_ENV === 'test' ? [{ provide: EventRegistrationsService, useValue: {} }] : [EventRegistrationsService];

@Module({ imports: persistence, controllers: [EventRegistrationsController], providers, exports: [EventRegistrationsService] })
export class EventRegistrationsModule {}
