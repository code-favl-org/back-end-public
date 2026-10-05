import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRefreshToAuthSessions2026093013000 implements MigrationInterface {
  name = 'AddRefreshToAuthSessions2026093013000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE auth_sessions
        ADD refresh_token_hash CHAR(64) NULL,
        ADD refresh_expires_at DATETIME NULL,
        ADD UNIQUE KEY UQ_auth_sessions_refresh_token_hash (refresh_token_hash)
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE auth_sessions
        DROP INDEX UQ_auth_sessions_refresh_token_hash,
        DROP COLUMN refresh_token_hash,
        DROP COLUMN refresh_expires_at
    `);
  }
}