import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { User } from '../../entities/user.entity';
import { ApiKey } from '../../entities/api-key.entity';
import { Notification } from '../../entities/notification.entity';
// import { RequestLog } from '../../entities/request-log.entity';

@Injectable()
export class DatabaseConfig implements TypeOrmOptionsFactory {
    constructor(private configService: ConfigService) {}

    createTypeOrmOptions(): TypeOrmModuleOptions {
        const isProduction =
            this.configService.get('NODE_ENV') === 'production';

        return {
            type: 'postgres',
            host: this.configService.get<string>('DB_HOST', 'localhost'),
            port: this.configService.get<number>('DB_PORT', 5432),
            username: this.configService.get<string>('DB_USER'),
            password: this.configService.get<string>('DB_PASSWORD'),
            database: this.configService.get<string>('DB_NAME'),
            schema: this.configService.get<string>('DB_SCHEMA', 'public'),

            extra: {
                max: this.configService.get<number>('DB_POOL_SIZE', 20),
                connectionTimeoutMillis: this.configService.get<number>(
                    'DB_CONNECTION_TIMEOUT',
                    60000,
                ),
                idleTimeoutMillis: this.configService.get<number>(
                    'DB_IDLE_TIMEOUT',
                    600000,
                ),
                query_timeout: this.configService.get<number>(
                    'DB_MAX_QUERY_EXECUTION_TIME',
                    60000,
                ),
            },

            entities: [
                User,
                ApiKey,
                Notification,
                // RequestLog
            ],

            migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
            migrationsTableName: 'migrations_history',
            migrationsRun: this.configService.get<boolean>(
                'AUTO_RUN_MIGRATIONS',
                false,
            ),

            synchronize: this.configService.get<boolean>(
                'DB_SYNCHRONIZE',
                false,
            ),
            logging: isProduction ? ['error', 'warn'] : true,
            logger: 'advanced-console',

            maxQueryExecutionTime: this.configService.get<number>(
                'DB_MAX_QUERY_EXECUTION_TIME',
                60000,
            ),

            ssl: isProduction ? { rejectUnauthorized: false } : false,
        };
    }
}
