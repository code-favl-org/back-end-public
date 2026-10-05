import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'gallery_images' })
export class GalleryImage {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 40, nullable: true })
  category: string | null;

  @Column({ name: 'source_url', type: 'text', nullable: true })
  sourceUrl: string | null;

  @Column({ type: 'varchar', length: 240, nullable: true })
  caption: string | null;

  @Column({ name: 'alt_text', type: 'varchar', length: 240, nullable: true })
  altText: string | null;

  @Column({ name: 'sort_order', type: 'int', nullable: true })
  sortOrder: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 3, nullable: true })
  createdAt: Date | null;
}