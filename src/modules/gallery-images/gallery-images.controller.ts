import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PermissionResource } from '../../common/decorators/permissions.decorator';
import { BaseCrudController } from '../../common/controllers/base-crud.controller';
import { GalleryImage } from './entities/gallery-image.entity';
import { GalleryImagesService } from './gallery-images.service';

@ApiTags('Galería')
@PermissionResource('gallery_images')
@Controller('galeria')
export class GalleryImagesController extends BaseCrudController<GalleryImage> {
  constructor(private readonly gallery: GalleryImagesService) {
    super(gallery);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar imágenes de galería' })
  @ApiQuery({ name: 'categoria', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@Query('categoria') category?: string, @Query('limit') limit?: string) {
    return this.gallery.findPublic(category, limit);
  }
}
