import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NewsArticlesService } from './news-articles.service';

@ApiTags('Noticias')
@Controller('noticias')
export class NewsArticlesController {
  constructor(private readonly news: NewsArticlesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar noticias publicadas' })
  findAll() {
    return this.news.findPublic();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener noticia publicada por ID' })
  findPublicById(@Param('id', ParseIntPipe) id: number) {
    return this.news.findPublicById(id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Obtener noticia publicada por slug' })
  findPublicBySlug(@Param('slug') slug: string) {
    return this.news.findPublicBySlug(slug);
  }
}
