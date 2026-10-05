import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GalleryImage } from './entities/gallery-image.entity';
import { GalleryImagesService } from './gallery-images.service';
import { GalleryImagesController } from './gallery-images.controller';

const persistence = process.env.NODE_ENV === 'test' ? [] : [TypeOrmModule.forFeature([GalleryImage])];
const providers = process.env.NODE_ENV === 'test' ? [{ provide: GalleryImagesService, useValue: {} }] : [GalleryImagesService];

@Module({ imports: persistence, controllers: [GalleryImagesController], providers, exports: [GalleryImagesService] })
export class GalleryImagesModule {}
