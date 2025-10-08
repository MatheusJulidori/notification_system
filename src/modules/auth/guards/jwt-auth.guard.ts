import {
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AppLoggerService } from '../../../common/services/logger.service';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private readonly logger: AppLoggerService) {
        super();
        this.logger.setContext(JwtAuthGuard.name);
    }

    /**
     * Handles authentication errors
     * @param err - Error from passport strategy
     * @param user - User object (if authentication succeeded)
     * @param info - Additional info from passport
     * @returns User object or throws exception
     */
    handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();

        // Log authentication attempt
        this.logger.log(
            `JWT Auth attempt for ${request.method} ${request.url}`,
        );

        if (err || !user) {
            this.logger.warn(
                `JWT authentication failed: \n ####ERROR#### ${err?.message} \n ####INFO#### ${info?.message} \n ####URL#### ${request.url}`,
            );

            // Provide specific error messages
            if (info?.name === 'TokenExpiredError') {
                throw new UnauthorizedException('Token has expired');
            }

            if (info?.name === 'JsonWebTokenError') {
                throw new UnauthorizedException('Invalid token');
            }

            if (info?.name === 'NotBeforeError') {
                throw new UnauthorizedException('Token not active yet');
            }

            throw err || new UnauthorizedException('Authentication failed');
        }

        this.logger.log(`JWT authentication successful for user: ${user.id}`);
        return user;
    }

    /**
     * Can be overridden to add custom logic before authentication
     * @param context - Execution context
     * @returns Boolean indicating if authentication should proceed
     */
    canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();

        // Log the attempt
        this.logger.log(
            `Checking JWT auth for ${request.method} ${request.url}`,
        );

        return super.canActivate(context);
    }
}
