import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findPublicBySlug(slug: string) {
    const article = await this.repository.findOne({
      where: { slug, status: 'publicada' },
    });
    if (!article) throw new NotFoundException('Noticia no encontrada.');

    return this.toPublicDetail(article);
  }

  async findPublicById(id: number) {
    const article = await this.repository.findOne({
      where: { id, status: 'publicada' },
    });
    if (!article) throw new NotFoundException('Noticia no encontrada.');

    return this.toPublicDetail(article);
  }

  private toPublicDetail(article: NewsArticle) {
    return {
      id: Number(article.id),
      slug: article.slug,
      titulo: article.title,
      destacadaEnHero: Boolean(article.isFeaturedInHero),
      tags: article.tags ?? [],
      resumen: article.summary,
      contenido: article.content,
      imagen: article.imageUrl,
      fecha: article.publishedDate,
      categoria: article.category,
    };
  }
}
