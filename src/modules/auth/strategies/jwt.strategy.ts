import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/services/user.service';
import { JwtPayload } from '../services/jwt-token.service';
import { User } from '../../../entities/user.entity';
import { AppLoggerService } from '../../../common/services/logger.service';
import { UserStatus } from '../../../common/enums/user';

/**
 * JWT Strategy
 *
 * Passport strategy for validating JWT tokens.
 * Automatically called by JwtAuthGuard when a route is protected.
 *
 * Flow:
 * 1. Extracts JWT from Authorization header (Bearer token)
 * 2. Verifies JWT signature and expiration
 * 3. Calls validate() with decoded payload
 * 4. Returns user object which is attached to request
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        private readonly configService: ConfigService,
        private readonly userService: UserService,
        private readonly logger: AppLoggerService,
    ) {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
            throw new Error(
                'JWT_SECRET is not defined in environment variables',
            );
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
        this.logger.setContext(JwtStrategy.name);
    }

    /**
     * Validates the JWT payload and returns the user
     * Called automatically after JWT verification
     * @param payload - Decoded JWT payload
     * @returns User object (attached to request as req.user)
     * @throws UnauthorizedException if user not found or account status invalid
     */
    async validate(payload: JwtPayload): Promise<User> {
        this.logger.logMethodEntry('validate', { userId: payload.sub });

        // Fetch user from database
        const user = await this.userService.findById(payload.sub);

        if (!user) {
            this.logger.warn(`User not found: ${payload.sub}`);
            throw new UnauthorizedException('User not found');
        }

        // Check user status
        if (user.status === UserStatus.INACTIVE) {
            this.logger.warn(`Inactive user tried to access: ${user.id}`);
            throw new UnauthorizedException(
                'Account is inactive. Please activate your account.',
            );
        }

        if (user.status === UserStatus.SUSPENDED) {
            this.logger.warn(`Suspended user tried to access: ${user.id}`);
            throw new UnauthorizedException(
                'Account has been suspended. Please contact support.',
            );
        }

        this.logger.log(`User validated successfully: ${user.id}`);
        this.logger.logMethodExit('validate', { userId: user.id });

        // Return user (will be attached to request as req.user)
        return user;
    }
}
