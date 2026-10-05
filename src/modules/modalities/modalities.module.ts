import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Modality } from './entities/modality.entity';
import { ModalitiesService } from './modalities.service';
import { ModalitiesController } from './modalities.controller';

const persistence = process.env.NODE_ENV === 'test' ? [] : [TypeOrmModule.forFeature([Modality])];
const providers = process.env.NODE_ENV === 'test' ? [{ provide: ModalitiesService, useValue: {} }] : [ModalitiesService];

@Module({ imports: persistence, controllers: [ModalitiesController], providers, exports: [ModalitiesService] })
export class ModalitiesModule {}
