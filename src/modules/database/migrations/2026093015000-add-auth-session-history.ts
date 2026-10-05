import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAuthSessionHistory2026093015000 implements MigrationInterface {
  name = 'AddAuthSessionHistory2026093015000';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn('auth_sessions', 'last_used_at'))) {
      await queryRunner.query(
        'ALTER TABLE auth_sessions ADD last_used_at DATETIME NULL',
      );
    }
    if (!(await queryRunner.hasColumn('auth_sessions', 'revoked_at'))) {
      await queryRunner.query(
        'ALTER TABLE auth_sessions ADD revoked_at DATETIME NULL',
      );
    }
    await queryRunner.query(`
      UPDATE auth_sessions
      SET last_used_at = created_at
      WHERE last_used_at IS NULL
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE auth_sessions DROP COLUMN revoked_at, DROP COLUMN last_used_at',
    );
  }
}