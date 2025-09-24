import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

dotenv.config();

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            transformOptions: { enableImplicitConversion: true },
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );

    app.setGlobalPrefix('/api/v1');

    const config = new DocumentBuilder()
        .setTitle('Unified Notifications API')
        .setDescription('Unified Notifications API Documentation')
        .setVersion('1.0')
        .addTag('Notifications', 'Notification management operations')
        .addTag('User', 'User management operations')
        .addTag('API Keys', 'API Key management operations')
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
