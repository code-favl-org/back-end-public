import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MapLocation } from './entities/map-location.entity';
import { MapLocationsService } from './map-locations.service';
import { MapLocationsController } from './map-locations.controller';

const persistence = process.env.NODE_ENV === 'test' ? [] : [TypeOrmModule.forFeature([MapLocation])];
const providers = process.env.NODE_ENV === 'test' ? [{ provide: MapLocationsService, useValue: {} }] : [MapLocationsService];

@Module({ imports: persistence, controllers: [MapLocationsController], providers, exports: [MapLocationsService] })
export class MapLocationsModule {}
