import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseCrudService } from '../../common/database/base-crud.service';
import { NewsArticle } from './entities/news-article.entity';

@Injectable()
export class NewsArticlesService extends BaseCrudService<NewsArticle> {
  constructor(@InjectRepository(NewsArticle) repository: Repository<NewsArticle>) {
    super(repository);
  }

  async findPublic() {
    const articles = await this.repository.find({
      where: { status: 'publicada' },
      order: { publishedDate: 'DESC', id: 'DESC' },
    });
    return articles.map((article) => ({
      id: Number(article.id),
      slug: article.slug,
      titulo: article.title,
      destacadaEnHero: Boolean(article.isFeaturedInHero),
      tags: article.tags ?? [],
      resumen: article.summary,
      imagen: article.imageUrl,
      fecha: article.publishedDate,
    }));
  }
}
