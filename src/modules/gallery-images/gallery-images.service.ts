import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseCrudService } from '../../common/database/base-crud.service';
import { GalleryImage } from './entities/gallery-image.entity';

const MAX_GALLERY_LIMIT = 100;

@Injectable()
export class GalleryImagesService extends BaseCrudService<GalleryImage> {
  constructor(@InjectRepository(GalleryImage) repository: Repository<GalleryImage>) {
    super(repository);
  }

  async findPublic(category?: string, limitValue?: string) {
    const query = this.repository.createQueryBuilder('image');
    if (category) query.andWhere('image.category = :category', { category });
    if (limitValue !== undefined) {
      const limit = Number(limitValue);
      if (!Number.isSafeInteger(limit) || limit <= 0) {
        throw new BadRequestException('limit must be a positive integer.');
      }
      query.take(Math.min(limit, MAX_GALLERY_LIMIT));
    }
    const images = await query.orderBy('image.sortOrder', 'ASC').addOrderBy('image.id', 'ASC').getMany();
    return images.map((image) => ({
      id: Number(image.id),
      categoria: image.category,
      src: image.sourceUrl,
      caption: image.caption,
    }));
  }
}
