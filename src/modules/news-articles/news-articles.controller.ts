import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PermissionResource } from '../../common/decorators/permissions.decorator';
import { BaseCrudController } from '../../common/controllers/base-crud.controller';
import { NewsArticle } from './entities/news-article.entity';
import { NewsArticlesService } from './news-articles.service';

@ApiTags('Noticias')
@PermissionResource('news_articles')
@Controller('noticias')
export class NewsArticlesController extends BaseCrudController<NewsArticle> {
  constructor(private readonly news: NewsArticlesService) {
    super(news);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Listar noticias publicadas' })
  findAll() {
    return this.news.findPublic();
  }
}
