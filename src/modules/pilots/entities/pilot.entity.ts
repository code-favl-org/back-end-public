import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'pilots' })
export class Pilot {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'user_id', type: 'bigint', unsigned: true, nullable: true })
  userId: number | null;

  @Column({ name: 'club_id', type: 'bigint', unsigned: true, nullable: true })
  clubId: number | null;

  @Column({ name: 'national_id', type: 'varchar', length: 32, nullable: true })
  nationalId: string | null;

  @Column({ type: 'varchar', length: 180, nullable: true })
  name: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  category: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  status: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 3, nullable: true })
  createdAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 3, nullable: true })
  updatedAt: Date | null;
}