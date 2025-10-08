import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../../redis/redis.service';
import { AppLoggerService } from '../../../common/services/logger.service';
import { User } from '../../../entities/user.entity';

export interface JwtPayload {
    sub: string; // User ID
    username: string;
    email: string;
    iat?: number; // Issued at
    exp?: number; // Expiration
}

export interface TokenPair {
    access_token: string;
    refresh_token: string;
    expires_in: number;
}

/**
 * JWT Token Service
 *
 * Handles all JWT token generation, validation, and management.
 * Separated from AuthService for better encapsulation and reusability.
 */
@Injectable()
export class JwtTokenService {
    private readonly ACCESS_TOKEN_EXPIRY = '15m';
    private readonly REFRESH_TOKEN_EXPIRY = '7d';
    private readonly REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days
    private readonly ACCESS_TOKEN_EXPIRY_SECONDS = 15 * 60; // 15 minutes

    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly redisService: RedisService,
        private readonly logger: AppLoggerService,
    ) {
        this.logger.setContext(JwtTokenService.name);
    }

    /**
     * Generates access and refresh tokens for a user
     * @param user - The user to generate tokens for
     * @returns Token pair with access token, refresh token, and expiry time
     */
    async generateTokenPair(user: User): Promise<TokenPair> {
        this.logger.logMethodEntry('generateTokenPair', { userId: user.id });

        const payload: JwtPayload = {
            sub: user.id,
            username: user.username,
            email: user.email,
        };

        // Generate access token
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: this.ACCESS_TOKEN_EXPIRY,
            secret: this.configService.get<string>('JWT_SECRET'),
        });

        // Generate refresh token
        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: this.REFRESH_TOKEN_EXPIRY,
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        });

        // Store refresh token in Redis for validation
        await this.storeRefreshToken(refreshToken, user.id);

        this.logger.log(`Token pair generated for user: ${user.id}`);
        this.logger.logMethodExit('generateTokenPair', {
            userId: user.id,
            hasAccessToken: !!accessToken,
            hasRefreshToken: !!refreshToken,
        });

        return {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: this.ACCESS_TOKEN_EXPIRY_SECONDS,
        };
    }

    /**
     * Validates and decodes an access token
     * @param token - The JWT access token to validate
     * @returns Decoded JWT payload
     * @throws UnauthorizedException if token is invalid
     */
    async validateAccessToken(token: string): Promise<JwtPayload> {
        this.logger.logMethodEntry('validateAccessToken');

        try {
            const payload = this.jwtService.verify<JwtPayload>(token, {
                secret: this.configService.get<string>('JWT_SECRET'),
            });

            this.logger.log(`Access token validated for user: ${payload.sub}`);
            this.logger.logMethodExit('validateAccessToken', {
                userId: payload.sub,
            });

            return payload;
        } catch (error) {
            this.logger.error('Invalid access token', error);
            throw error;
        }
    }

    /**
     * Validates a refresh token
     * @param refreshToken - The refresh token to validate
     * @returns User ID if valid
     * @throws UnauthorizedException if token is invalid or revoked
     */
    async validateRefreshToken(refreshToken: string): Promise<string> {
        this.logger.logMethodEntry('validateRefreshToken');

        try {
            // Verify JWT signature and expiration
            const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            });

            // Check if token exists in Redis (not revoked)
            const storedUserId = await this.redisService.get(
                `refresh_token:${refreshToken}`,
            );

            if (!storedUserId) {
                this.logger.warn('Refresh token not found in Redis (revoked)');
                throw new Error('Refresh token has been revoked');
            }

            if (storedUserId !== payload.sub) {
                this.logger.warn('Refresh token user ID mismatch');
                throw new Error('Invalid refresh token');
            }

            this.logger.log(`Refresh token validated for user: ${payload.sub}`);
            this.logger.logMethodExit('validateRefreshToken', {
                userId: payload.sub,
            });

            return payload.sub;
        } catch (error) {
            this.logger.error('Invalid refresh token', error);
            throw error;
        }
    }

    /**
     * Revokes a refresh token
     * @param refreshToken - The refresh token to revoke
     */
    async revokeRefreshToken(refreshToken: string): Promise<void> {
        this.logger.logMethodEntry('revokeRefreshToken');

        await this.redisService.del(`refresh_token:${refreshToken}`);

        this.logger.log('Refresh token revoked');
        this.logger.logMethodExit('revokeRefreshToken');
    }

    /**
     * Stores a refresh token in Redis with TTL
     * @param refreshToken - The refresh token to store
     * @param userId - The user ID associated with the token
     */
    private async storeRefreshToken(
        refreshToken: string,
        userId: string,
    ): Promise<void> {
        this.logger.logMethodEntry('storeRefreshToken', { userId });

        await this.redisService.setex(
            `refresh_token:${refreshToken}`,
            this.REFRESH_TOKEN_TTL_SECONDS,
            userId,
        );

        this.logger.log(`Refresh token stored for user: ${userId}`);
        this.logger.logMethodExit('storeRefreshToken');
    }

    /**
     * Decodes a JWT token without validating it (useful for debugging)
     * @param token - The JWT token to decode
     * @returns Decoded payload or null if invalid
     */
    decodeToken(token: string): JwtPayload | null {
        try {
            return this.jwtService.decode(token) as JwtPayload;
        } catch (error) {
            this.logger.error('Failed to decode token', error);
            return null;
        }
    }
}
