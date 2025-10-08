import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class RateLimiterService {
  constructor(private readonly redisService: RedisService) {}

  async checkRateLimit(identifier: string, limit: number, windowSeconds: number = 60): Promise<{
    allowed: boolean;
    count: number;
    resetTime: number;
  }> {
    const key = `rate_limit:${identifier}`;
    const now = Math.floor(Date.now() / 1000);
    const windowStart = now - windowSeconds;

    const client = this.redisService.getClient();
    
    // Use a sliding window approach with sorted sets
    const pipeline = client.pipeline();
    
    // Remove old entries
    pipeline.zremrangebyscore(key, '-inf', windowStart);
    
    // Add current request
    pipeline.zadd(key, now, `${now}-${Math.random()}`);
    
    // Count current requests
    pipeline.zcard(key);
    
    // Set expiration
    pipeline.expire(key, windowSeconds);
    
    const results = await pipeline.exec();
    const count = results?.[2]?.[1] as number || 0;

    return {
      allowed: count <= limit,
      count,
      resetTime: now + windowSeconds,
    };
  }

  async checkApiKeyRateLimit(apiKeyId: string, limitPerMinute: number): Promise<boolean> {
    const result = await this.checkRateLimit(`api_key:${apiKeyId}`, limitPerMinute, 60);
    return result.allowed;
  }

  async checkUserRateLimit(userId: string, limitPerHour: number): Promise<boolean> {
    const result = await this.checkRateLimit(`user:${userId}`, limitPerHour, 3600);
    return result.allowed;
  }
}