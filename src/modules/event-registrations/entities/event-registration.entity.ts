import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'event_registrations' })
export class EventRegistration {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'event_id', type: 'bigint', unsigned: true, nullable: true })
  eventId: number | null;

  @Column({ name: 'pilot_id', type: 'bigint', unsigned: true, nullable: true })
  pilotId: number | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  status: string | null;

  @CreateDateColumn({ name: 'registered_at', type: 'datetime', precision: 3, nullable: true })
  registeredAt: Date | null;

  @Column({ name: 'canceled_at', type: 'datetime', precision: 3, nullable: true })
  canceledAt: Date | null;
}