import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';

config({ path: '.env' });

const configService = new ConfigService();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: configService.get<number>('DB_PORT'),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_DATABASE'),
  schema: configService.get('DB_SCHEMA', 'public'),
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/shared/database/migrations/*.ts'],
  synchronize: false,
  logging: true,
});