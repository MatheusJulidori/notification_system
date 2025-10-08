import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class SessionService {
  constructor(private readonly redisService: RedisService) {}

  async storeRefreshToken(token: string, userId: string, ttl: number = 2592000): Promise<void> {
    const key = `refresh_token:${token}`;
    await this.redisService.setex(key, ttl, userId);
  }

  async getRefreshTokenUserId(token: string): Promise<string | null> {
    const key = `refresh_token:${token}`;
    return await this.redisService.get(key);
  }

  async revokeRefreshToken(token: string): Promise<void> {
    const key = `refresh_token:${token}`;
    await this.redisService.del(key);
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    const pattern = 'refresh_token:*';
    const client = this.redisService.getClient();
    
    const stream = client.scanStream({
      match: pattern,
      count: 100,
    });

    stream.on('data', async (keys: string[]) => {
      if (keys.length) {
        const pipeline = client.pipeline();
        
        for (const key of keys) {
          const storedUserId = await this.redisService.get(key);
          if (storedUserId === userId) {
            pipeline.del(key);
          }
        }
        
        await pipeline.exec();
      }
    });
  }
}