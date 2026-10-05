import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventRegistration } from '../event-registrations/entities/event-registration.entity';
import { Event } from './entities/event.entity';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';

const persistence = process.env.NODE_ENV === 'test' ? [] : [TypeOrmModule.forFeature([Event, EventRegistration])];
const providers = process.env.NODE_ENV === 'test' ? [{ provide: EventsService, useValue: {} }] : [EventsService];

@Module({ imports: persistence, controllers: [EventsController], providers, exports: [EventsService] })
export class EventsModule {}
