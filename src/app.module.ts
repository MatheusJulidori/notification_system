import { Module, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from 'nestjs-pino';
import { randomUUID } from 'crypto';

import { DatabaseModule } from './modules/database/database.module';
import { HealthModule } from './modules/health/health.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        ThrottlerModule.forRoot([
            {
                ttl: 10,
                limit: 30,
            },
        ]),
        LoggerModule.forRoot({
            pinoHttp: {
                genReqId: (req) => req.headers['x-request-id'] || randomUUID(),
                customProps: (req) => ({
                    requestId: req.id,
                }),
                transport:
                    process.env.NODE_ENV !== 'production'
                        ? {
                              target: 'pino-pretty',
                              options: {
                                  colorize: true,
                                  translateTime: 'SYS:standard',
                                  ignore: 'pid,hostname',
                              },
                          }
                        : undefined,
                autoLogging: {
                    ignore: (req) => req.url === '/api/v1/health',
                },
            },
        }),
        DatabaseModule,
        HealthModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        Logger,
        { provide: APP_GUARD, useClass: ThrottlerGuard },
    ],
})
export class AppModule {}
