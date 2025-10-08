import { Injectable, Logger, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.TRANSIENT })
export class AppLoggerService {
    private logger: Logger;
    private context: string = 'Application';

    constructor() {
        this.logger = new Logger(this.context);
    }

    /**
     * Set the context for this logger instance
     * This helps identify which service/module is logging
     */
    setContext(context: string) {
        this.context = context;
        this.logger = new Logger(context);
    }

    log(message: string, context?: string) {
        this.logger.log(message, context || this.context);
    }

    error(message: string, trace?: string, context?: string) {
        this.logger.error(message, trace, context || this.context);
    }

    warn(message: string, context?: string) {
        this.logger.warn(message, context || this.context);
    }

    /**
     * Log debug messages (only in development)
     */
    debug(message: string, context?: string) {
        if (process.env.NODE_ENV !== 'production') {
            this.logger.debug(message, context || this.context);
        }
    }

    /**
     * Log verbose messages (only in development)
     */
    verbose(message: string, context?: string) {
        if (process.env.NODE_ENV !== 'production') {
            this.logger.verbose(message, context || this.context);
        }
    }

    /**
     * Log with additional metadata
     */
    logWithMetadata(
        level: 'log' | 'error' | 'warn' | 'debug' | 'verbose',
        message: string,
        metadata?: Record<string, any>,
        context?: string,
    ) {
        const logMessage = metadata
            ? `${message} - ${JSON.stringify(metadata)}`
            : message;

        this.logger[level](logMessage, context || this.context);
    }

    /**
     * Log method entry (useful for debugging)
     */
    logMethodEntry(methodName: string, params?: any) {
        if (process.env.NODE_ENV !== 'production') {
            const message = params
                ? `Entering ${methodName} with params: ${JSON.stringify(params)}`
                : `Entering ${methodName}`;
            this.logger.debug(message, this.context);
        }
    }

    /**
     * Log method exit (useful for debugging)
     */
    logMethodExit(methodName: string, result?: any) {
        if (process.env.NODE_ENV !== 'production') {
            const message = result
                ? `Exiting ${methodName} with result: ${JSON.stringify(result)}`
                : `Exiting ${methodName}`;
            this.logger.debug(message, this.context);
        }
    }

    /**
     * Log database operations
     */
    logDatabaseOperation(
        operation: string,
        entity: string,
        metadata?: Record<string, any>,
    ) {
        const message = `Database ${operation} on ${entity}`;
        this.logWithMetadata('debug', message, metadata);
    }
}
