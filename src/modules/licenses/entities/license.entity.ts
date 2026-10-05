import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'licenses' })
export class License {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'pilot_id', type: 'bigint', unsigned: true, nullable: true })
  pilotId: number | null;

  @Column({ name: 'license_number', type: 'varchar', length: 32, nullable: true })
  licenseNumber: string | null;

  @Column({ name: 'modality_code', type: 'varchar', length: 40, nullable: true })
  modalityCode: string | null;

  @Column({ type: 'varchar', length: 80, nullable: true })
  category: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  status: string | null;

  @Column({ name: 'issued_at', type: 'date', nullable: true })
  issuedAt: string | null;

  @Column({ name: 'expires_at', type: 'date', nullable: true })
  expiresAt: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'datetime', precision: 3, nullable: true })
  createdAt: Date | null;

  @UpdateDateColumn({ name: 'updated_at', type: 'datetime', precision: 3, nullable: true })
  updatedAt: Date | null;
}