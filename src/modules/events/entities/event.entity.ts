import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'events' })
export class Event {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 220, nullable: true })
  slug: string | null;

  @Column({ type: 'varchar', length: 240, nullable: true })
  title: string | null;

  @Column({ name: 'modality_code', type: 'varchar', length: 40, nullable: true })
  modalityCode: string | null;

  @Column({ name: 'tags_json', type: 'simple-json', nullable: true })
  tags: string[] | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  type: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  status: string | null;

  @Column({ name: 'start_date', type: 'date', nullable: true })
  startDate: string | null;

  @Column({ name: 'end_date', type: 'date', nullable: true })
  endDate: string | null;

  @Column({ type: 'varchar', length: 180, nullable: true })
  venue: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  province: string | null;

  @Column({ type: 'int', unsigned: true, nullable: true })
  capacity: number | null;

  @Column({ name: 'image_url', type: 'text', nullable: true })
  imageUrl: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'organizer_url', type: 'text', nullable: true })
  organizerUrl: string | null;

  @Column({ name: 'created_by', type: 'bigint', unsigned: true, nullable: true })
  createdBy: number | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 3, nullable: true })
  createdAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 3, nullable: true })
  updatedAt: Date | null;
}