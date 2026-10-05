import { MigrationInterface, QueryRunner } from 'typeorm';

const DOMAIN_TABLES = [
  'clubs',
  'events',
  'event_registrations',
  'gallery_images',
  'home_statistics',
  'licenses',
  'map_locations',
  'modalities',
  'news_articles',
  'permissions',
  'pilots',
  'roles',
] as const;

export class AddDomainPrimaryKeys2026100100000 implements MigrationInterface {
  name = 'AddDomainPrimaryKeys2026100100000';

  async up(queryRunner: QueryRunner): Promise<void> {
    for (const table of DOMAIN_TABLES) {
      if (!(await queryRunner.hasTable(table))) {
        throw new Error(`Required table ${table} does not exist.`);
      }
      const tableMetadata = await queryRunner.getTable(table);
      if (tableMetadata?.primaryColumns.length) continue;

      const [integrity] = await queryRunner.query(`
        SELECT COUNT(*) AS total,
          SUM(id IS NULL) AS nullIds,
          COUNT(DISTINCT id) AS distinctIds
        FROM \`${table}\`
      `);

      if (
        Number(integrity.nullIds ?? 0) !== 0 ||
        Number(integrity.total) !== Number(integrity.distinctIds)
      ) {
        throw new Error(`Cannot add primary key to ${table}: IDs contain nulls or duplicates.`);
      }

      await queryRunner.query(
        `ALTER TABLE \`${table}\` MODIFY id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT, ADD PRIMARY KEY (id)`,
      );
    }
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of [...DOMAIN_TABLES].reverse()) {
      const tableMetadata = await queryRunner.getTable(table);
      if (!tableMetadata?.primaryColumns.length) continue;
      await queryRunner.query(
        `ALTER TABLE \`${table}\` DROP PRIMARY KEY, MODIFY id BIGINT UNSIGNED NULL`,
      );
    }
  }
}