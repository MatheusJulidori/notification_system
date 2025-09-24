import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { catchError, Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    constructor(private readonly logger: PinoLogger) {}

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();
        const response = ctx.getResponse<Response>();

        const { method, url } = request;

        if (url === '/api/v1/health') {
            return next.handle();
        }

        const requestId = request.id ?? '-';
        const userAgent = request.headers['user-agent'] ?? '-';
        const now = Date.now();

        this.logger.info(
            {
                method,
                url,
                requestId,
                userAgent,
            },
            'Incoming request',
        );

        return next.handle().pipe(
            tap(() => {
                const duration = Date.now() - now;
                this.logger.info(
                    {
                        method,
                        url,
                        requestId,
                        statusCode: response.statusCode,
                        duration,
                    },
                    'Request completed',
                );
            }),
            catchError((err) => {
                const duration = Date.now() - now;
                this.logger.error(
                    {
                        method,
                        url,
                        requestId,
                        statusCode: response.statusCode,
                        duration,
                        error: err?.message,
                    },
                    'Request failed',
                );
                throw err;
            }),
        );
    }
}
