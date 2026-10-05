import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Club } from '../clubs/entities/club.entity';
import { License } from '../licenses/entities/license.entity';
import { Pilot } from './entities/pilot.entity';
import { PilotsService } from './pilots.service';
import { PilotsController, PilotVerificationController } from './pilots.controller';

const persistence = process.env.NODE_ENV === 'test' ? [] : [TypeOrmModule.forFeature([Pilot, License, Club])];
const providers = process.env.NODE_ENV === 'test' ? [{ provide: PilotsService, useValue: {} }] : [PilotsService];

@Module({ imports: persistence, controllers: [PilotsController, PilotVerificationController], providers, exports: [PilotsService] })
export class PilotsModule {}
