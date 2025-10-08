import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(GlobalExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: string | string[] = 'Internal server error';
        let error = 'Internal Server Error';
        let details: any = undefined;

        // HTTP exceptions (ConflictException, NotFoundException, etc.)
        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === 'object') {
                const responseObj = exceptionResponse as any;
                message = responseObj.message || exception.message;
                error = responseObj.error || error;
                details = responseObj.details;
            }
        }
        // TypeORM database errors
        else if (exception instanceof QueryFailedError) {
            status = HttpStatus.BAD_REQUEST;
            error = 'Database Error';
            message = 'Database operation failed';

            const dbError = exception as any;

            // Unique constraint violations
            if (dbError.code === '23505') {
                status = HttpStatus.CONFLICT;
                message = 'Resource already exists';
                details = {
                    constraint: dbError.constraint,
                    detail: dbError.detail,
                };
            }
            // Foreign key violations
            else if (dbError.code === '23503') {
                status = HttpStatus.BAD_REQUEST;
                message = 'Referenced resource does not exist';
                details = {
                    constraint: dbError.constraint,
                    detail: dbError.detail,
                };
            }
            // Not null violations
            else if (dbError.code === '23502') {
                status = HttpStatus.BAD_REQUEST;
                message = 'Required field is missing';
                details = {
                    column: dbError.column,
                };
            }
        }
        // Unknown errors
        else if (exception instanceof Error) {
            message = exception.message;
            details = {
                stack:
                    process.env.NODE_ENV === 'development'
                        ? exception.stack
                        : undefined,
            };
        }

        // Log the error
        const errorLog = {
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
            error,
            message,
            details,
            ...(process.env.NODE_ENV === 'development' && {
                stack: exception instanceof Error ? exception.stack : undefined,
            }),
        };

        if (status >= 500) {
            this.logger.error(
                `${request.method} ${request.url}`,
                JSON.stringify(errorLog),
            );
        } else {
            this.logger.warn(
                `${request.method} ${request.url}`,
                JSON.stringify(errorLog),
            );
        }

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
            error,
            message,
            ...(details && { details }),
        });
    }
}
