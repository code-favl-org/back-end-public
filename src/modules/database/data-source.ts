import { existsSync } from 'node:fs';
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';

if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

const required = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

export default new DataSource({
  type: 'mariadb',
  host: required('DB_HOST'),
  port: Number(process.env.DB_PORT ?? 3306),
  username: required('DB_USERNAME'),
  password: required('DB_PASSWORD'),
  database: required('DB_NAME'),
  entities: [User],
  synchronize: false,
});
