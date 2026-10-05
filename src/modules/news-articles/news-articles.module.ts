import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsArticle } from './entities/news-article.entity';
import { NewsArticlesService } from './news-articles.service';
import { NewsArticlesController } from './news-articles.controller';

const persistence = process.env.NODE_ENV === 'test' ? [] : [TypeOrmModule.forFeature([NewsArticle])];
const providers = process.env.NODE_ENV === 'test' ? [{ provide: NewsArticlesService, useValue: {} }] : [NewsArticlesService];

@Module({ imports: persistence, controllers: [NewsArticlesController], providers, exports: [NewsArticlesService] })
export class NewsArticlesModule {}
