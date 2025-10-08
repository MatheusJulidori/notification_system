import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class CacheService {
  constructor(private readonly redisService: RedisService) {}

  private getCacheKey(prefix: string, id: string): string {
    return `cache:${prefix}:${id}`;
  }

  async cacheUser(userId: string, userData: any, ttl: number = 3600): Promise<void> {
    const key = this.getCacheKey('user', userId);
    await this.redisService.setJson(key, userData, ttl);
  }

  async getCachedUser(userId: string): Promise<any | null> {
    const key = this.getCacheKey('user', userId);
    return await this.redisService.getJson(key);
  }

  async cacheApiKey(keyPrefix: string, apiKeyData: any, ttl: number = 300): Promise<void> {
    const key = this.getCacheKey('api_key', keyPrefix);
    await this.redisService.setJson(key, apiKeyData, ttl);
  }

  async getCachedApiKey(keyPrefix: string): Promise<any | null> {
    const key = this.getCacheKey('api_key', keyPrefix);
    return await this.redisService.getJson(key);
  }

  async invalidateUserCache(userId: string): Promise<void> {
    const key = this.getCacheKey('user', userId);
    await this.redisService.del(key);
  }

  async invalidateApiKeyCache(keyPrefix: string): Promise<void> {
    const key = this.getCacheKey('api_key', keyPrefix);
    await this.redisService.del(key);
  }
}