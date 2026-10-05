import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'modalities' })
export class Modality {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ type: 'varchar', length: 40, nullable: true })
  code: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  name: string | null;

  @Column({ type: 'boolean', nullable: true })
  active: boolean | null;
}