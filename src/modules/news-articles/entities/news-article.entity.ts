import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'news_articles' })
export class NewsArticle {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 220, nullable: true })
  slug: string | null;

  @Column({ type: 'varchar', length: 240, nullable: true })
  title: string | null;

  @Column({ name: 'is_featured_in_hero', type: 'boolean', nullable: true })
  isFeaturedInHero: boolean | null;

  @Column({ name: 'tags_json', type: 'simple-json', nullable: true })
  tags: string[] | null;

  @Column({ type: 'text', nullable: true })
  summary: string | null;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string | null;

  @Column({ name: 'published_date', type: 'date', nullable: true })
  publishedDate: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  status: string | null;

  @Column({ name: 'author_id', type: 'bigint', unsigned: true, nullable: true })
  authorId: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 3, nullable: true })
  createdAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 3, nullable: true })
  updatedAt: Date | null;
}