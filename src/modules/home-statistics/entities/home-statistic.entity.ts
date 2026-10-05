import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'home_statistics' })
export class HomeStatistic {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 60, nullable: true })
  code: string | null;

  @Column({ type: 'varchar', length: 40, nullable: true })
  value: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  label: string | null;

  @Column({ name: 'sort_order', type: 'int', nullable: true })
  sortOrder: number | null;

  @Column({ name: 'is_active', type: 'boolean', nullable: true })
  isActive: boolean | null;
}