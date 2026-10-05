import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAbsoluteAuthExpiry2026093014000 implements MigrationInterface {
  name = 'AddAbsoluteAuthExpiry2026093014000';

  async up(queryRunner: QueryRunner): Promise<void> {
    const hasAbsoluteExpiry = await queryRunner.hasColumn(
      'auth_sessions',
      'absolute_expires_at',
    );
    if (!hasAbsoluteExpiry) {
      await queryRunner.query(
        'ALTER TABLE auth_sessions ADD absolute_expires_at DATETIME NULL',
      );
    }
    await queryRunner.query(`
      UPDATE auth_sessions
      SET absolute_expires_at = COALESCE(refresh_expires_at, expires_at),
          refresh_expires_at = CASE
            WHEN refresh_token_hash IS NOT NULL
              THEN LEAST(refresh_expires_at, CURRENT_TIMESTAMP + INTERVAL 30 MINUTE)
            ELSE refresh_expires_at
          END
      WHERE absolute_expires_at IS NULL
    `);
    await queryRunner.query(
      'ALTER TABLE auth_sessions MODIFY absolute_expires_at DATETIME NOT NULL',
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE auth_sessions DROP COLUMN absolute_expires_at',
    );
  }
}