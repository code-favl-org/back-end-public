import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

const decimalToNumber = {
  to: (value: number | null) => value,
  from: (value: string | number | null) =>
    value === null ? null : Number(value),
};

@Entity({ name: 'map_locations' })
export class MapLocation {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: number;

  @Column({ name: 'club_id', type: 'bigint', unsigned: true, nullable: true })
  clubId: number | null;

  @Column({ type: 'varchar', length: 180, nullable: true })
  name: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  type: string | null;

  @Column({ name: 'modalities_json', type: 'simple-json', nullable: true })
  modalities: string[] | null;

  @Column({
    type: 'decimal',
    precision: 9,
    scale: 6,
    nullable: true,
    transformer: decimalToNumber,
  })
  latitude: number | null;

  @Column({
    type: 'decimal',
    precision: 9,
    scale: 6,
    nullable: true,
    transformer: decimalToNumber,
  })
  longitude: number | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  locality: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  province: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'contact_info', type: 'varchar', length: 254, nullable: true })
  contactInfo: string | null;

  @Column({ name: 'website_url', type: 'text', nullable: true })
  websiteUrl: string | null;

  @Column({ type: 'boolean', nullable: true })
  active: boolean | null;
}