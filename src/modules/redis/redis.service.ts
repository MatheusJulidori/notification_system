import {
    Injectable,
    Logger,
    OnModuleInit,
    OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(RedisService.name);
    private client: Redis;

    constructor(private readonly configService: ConfigService) {}

    async onModuleInit() {
        await this.createConnection();
    }

    async onModuleDestroy() {
        this.logger.log('Closing Redis connection...');
        try {
            if (this.client) {
                await this.client.quit();
                this.logger.log('Redis connection closed gracefully');
            }
        } catch (error) {
            this.logger.error('Error closing Redis connection:', error);
            await this.client?.disconnect();
        }
    }

    private async createConnection() {
        try {
            const config = {
                host: this.configService.get<string>('REDIS_HOST', 'localhost'),
                port: this.configService.get<number>('REDIS_PORT', 6379),
                password: this.configService.get<string>('REDIS_PASSWORD'),
                db: this.configService.get<number>('REDIS_DB', 0),
                retryDelayOnFailover: 100,
                maxRetriesPerRequest: 3,
                lazyConnect: true,
                keepAlive: 30000,
                connectTimeout: 10000,
                commandTimeout: 5000,
            };

            this.client = new Redis(config);

            // Event listeners
            this.client.on('connect', () => {
                this.logger.log('Redis connection established');
            });

            this.client.on('ready', () => {
                this.logger.log('Redis client ready');
            });

            this.client.on('error', (error) => {
                this.logger.error('Redis connection error:', error);
            });

            this.client.on('close', () => {
                this.logger.warn('Redis connection closed');
            });

            this.client.on('reconnecting', () => {
                this.logger.log('Redis client reconnecting...');
            });

            await this.client.connect();
        } catch (error) {
            this.logger.error('Failed to connect to Redis:', error);
            throw error;
        }
    }

    // Basic Operations
    async get(key: string): Promise<string | null> {
        try {
            return await this.client.get(key);
        } catch (error) {
            this.logger.error(`Error getting key ${key}:`, error);
            throw error;
        }
    }

    async set(key: string, value: string): Promise<void> {
        try {
            await this.client.set(key, value);
        } catch (error) {
            this.logger.error(`Error setting key ${key}:`, error);
            throw error;
        }
    }

    async setex(key: string, seconds: number, value: string): Promise<void> {
        try {
            await this.client.setex(key, seconds, value);
        } catch (error) {
            this.logger.error(
                `Error setting key ${key} with expiration:`,
                error,
            );
            throw error;
        }
    }

    async del(key: string): Promise<number> {
        try {
            return await this.client.del(key);
        } catch (error) {
            this.logger.error(`Error deleting key ${key}:`, error);
            throw error;
        }
    }

    async exists(key: string): Promise<number> {
        try {
            return await this.client.exists(key);
        } catch (error) {
            this.logger.error(`Error checking existence of key ${key}:`, error);
            throw error;
        }
    }

    async expire(key: string, seconds: number): Promise<number> {
        try {
            return await this.client.expire(key, seconds);
        } catch (error) {
            this.logger.error(`Error setting expiration on key ${key}:`, error);
            throw error;
        }
    }

    async ttl(key: string): Promise<number> {
        try {
            return await this.client.ttl(key);
        } catch (error) {
            this.logger.error(`Error getting TTL for key ${key}:`, error);
            throw error;
        }
    }

    // Counter Operations
    async incr(key: string): Promise<number> {
        try {
            return await this.client.incr(key);
        } catch (error) {
            this.logger.error(`Error incrementing key ${key}:`, error);
            throw error;
        }
    }

    async incrby(key: string, increment: number): Promise<number> {
        try {
            return await this.client.incrby(key, increment);
        } catch (error) {
            this.logger.error(
                `Error incrementing key ${key} by ${increment}:`,
                error,
            );
            throw error;
        }
    }

    async decr(key: string): Promise<number> {
        try {
            return await this.client.decr(key);
        } catch (error) {
            this.logger.error(`Error decrementing key ${key}:`, error);
            throw error;
        }
    }

    // Hash Operations
    async hget(key: string, field: string): Promise<string | null> {
        try {
            return await this.client.hget(key, field);
        } catch (error) {
            this.logger.error(
                `Error getting hash field ${field} from ${key}:`,
                error,
            );
            throw error;
        }
    }

    async hset(key: string, field: string, value: string): Promise<number> {
        try {
            return await this.client.hset(key, field, value);
        } catch (error) {
            this.logger.error(
                `Error setting hash field ${field} in ${key}:`,
                error,
            );
            throw error;
        }
    }

    async hgetall(key: string): Promise<Record<string, string>> {
        try {
            return await this.client.hgetall(key);
        } catch (error) {
            this.logger.error(
                `Error getting all hash fields from ${key}:`,
                error,
            );
            throw error;
        }
    }

    async hdel(key: string, ...fields: string[]): Promise<number> {
        try {
            return await this.client.hdel(key, ...fields);
        } catch (error) {
            this.logger.error(`Error deleting hash fields from ${key}:`, error);
            throw error;
        }
    }

    // List Operations
    async lpush(key: string, ...values: string[]): Promise<number> {
        try {
            return await this.client.lpush(key, ...values);
        } catch (error) {
            this.logger.error(`Error left pushing to list ${key}:`, error);
            throw error;
        }
    }

    async rpush(key: string, ...values: string[]): Promise<number> {
        try {
            return await this.client.rpush(key, ...values);
        } catch (error) {
            this.logger.error(`Error right pushing to list ${key}:`, error);
            throw error;
        }
    }

    async lpop(key: string): Promise<string | null> {
        try {
            return await this.client.lpop(key);
        } catch (error) {
            this.logger.error(`Error left popping from list ${key}:`, error);
            throw error;
        }
    }

    async rpop(key: string): Promise<string | null> {
        try {
            return await this.client.rpop(key);
        } catch (error) {
            this.logger.error(`Error right popping from list ${key}:`, error);
            throw error;
        }
    }

    async lrange(key: string, start: number, stop: number): Promise<string[]> {
        try {
            return await this.client.lrange(key, start, stop);
        } catch (error) {
            this.logger.error(`Error getting range from list ${key}:`, error);
            throw error;
        }
    }

    // JSON Operations (helper methods)
    async setJson<T>(key: string, value: T, ttl?: number): Promise<void> {
        const jsonValue = JSON.stringify(value);
        if (ttl) {
            await this.setex(key, ttl, jsonValue);
        } else {
            await this.set(key, jsonValue);
        }
    }

    async getJson<T>(key: string): Promise<T | null> {
        const value = await this.get(key);
        return value ? JSON.parse(value) : null;
    }

    // Health check
    async ping(): Promise<string> {
        try {
            return await this.client.ping();
        } catch (error) {
            this.logger.error('Redis ping failed:', error);
            throw error;
        }
    }

    async isHealthy(): Promise<boolean> {
        try {
            const result = await this.ping();
            return result === 'PONG';
        } catch {
            return false;
        }
    }

    // Get client for advanced operations
    getClient(): Redis {
        return this.client;
    }
}
