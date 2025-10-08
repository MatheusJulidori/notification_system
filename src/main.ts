import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as dotenv from 'dotenv';
import {
    ClassSerializerInterceptor,
    Logger,
    ValidationPipe,
} from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import helmet from 'helmet';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { NextFunction, Request, Response } from 'express';
import { doubleCsrfProtection } from './common/middlewares/double-csrf.middleware';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

dotenv.config();

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        bufferLogs: true,
    });

    const logger = await app.resolve(Logger);
    const pinoLogger = await app.resolve(PinoLogger);

    const corsOrigins = process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(',')
        : [];

    app.enableCors({
        origin: corsOrigins,
        credentials: true,
    });

    app.use(
        helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: ["'self'", "'unsafe-inline'"],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    imgSrc: ["'self'", 'data:'],
                    connectSrc: ["'self'", ...corsOrigins],
                },
            },
            crossOriginResourcePolicy: { policy: 'same-origin' },
        }),
    );

    app.useLogger(logger);
    app.useGlobalInterceptors(new LoggingInterceptor(pinoLogger));

    // Enable class-transformer for automatic serialization (excludes @Exclude() fields)
    app.useGlobalInterceptors(
        new ClassSerializerInterceptor(app.get(Reflector)),
    );

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            transformOptions: { enableImplicitConversion: true },
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );

    app.use(cookieParser());

    app.use((req: Request, res: Response, next: NextFunction) => {
        const shouldProtect =
            ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method as string) &&
            ![
                '/api/v1/auth/login',
                '/api/v1/auth/refresh-token',
                '/api/v1/auth/register',
                '/api/v1/auth/logout',
            ].includes(req.originalUrl as string);

        return shouldProtect ? doubleCsrfProtection(req, res, next) : next();
    });

    app.setGlobalPrefix('/api/v1');

    const config = new DocumentBuilder()
        .setTitle('Unified Notifications API')
        .setDescription('Unified Notifications API Documentation')
        .setVersion('1.0')
        .addTag('Notifications', 'Notification management operations')
        .addTag('User', 'User management operations')
        .addTag('API Keys', 'API Key management operations')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                name: 'JWT',
                description: 'Enter JWT token',
                in: 'header',
            },
            'JWT-auth',
        )
        .addApiKey(
            {
                type: 'apiKey',
                name: 'x-api-key',
                in: 'header',
            },
            'API-Key',
        )
        .addServer('http://localhost:4001', 'Development server')
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/v1/docs', app, document, {
        swaggerOptions: {
            persistAuthorization: true,
        },
        customSiteTitle: 'Unified Notifications API Documentation',
    });

    const port = process.env.PORT || 4001;
    console.log(`Server is running on port: ${port}`);
    console.log(
        `Swagger documentation available at: http://localhost:${port}/api/v1/docs`,
    );

    await app.listen(port);
}
bootstrap();
