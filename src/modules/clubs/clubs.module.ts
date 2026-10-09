import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Club } from './entities/club.entity';
import { ClubsService } from './clubs.service';
import { ClubsController } from './clubs.controller';

const persistence = process.env.NODE_ENV === 'test' ? [] : [TypeOrmModule.forFeature([Club])];
const providers =
	process.env.NODE_ENV === 'test'
		? [{ provide: ClubsService, useValue: { findPublic: () => Promise.resolve([]) } }]
		: [ClubsService];

@Module({ imports: persistence, controllers: [ClubsController], providers, exports: [ClubsService] })
export class ClubsModule {}
