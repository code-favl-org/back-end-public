import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BaseCrudController } from '../../common/controllers/base-crud.controller';
import { GalleryImage } from './entities/gallery-image.entity';
import { GalleryImagesService } from './gallery-images.service';

@ApiTags('Galería')
@Controller('galeria')
export class GalleryImagesController extends BaseCrudController<GalleryImage> {
  constructor(private readonly gallery: GalleryImagesService) {
    super(gallery);
  }

  @Get()
  @ApiOperation({ summary: 'Listar imágenes de galería' })
  @ApiQuery({ name: 'categoria', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('categoria') category?: string,
    @Query('limit') limit?: string,
  ) {
    return this.gallery.findPublic(category, limit);
  }
}
