import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisService } from './redis.service';
import { CacheService } from './cache.service';
import { SessionService } from './session.service';
import { RateLimiterService } from './rate-limiter.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    RedisService,
    CacheService,
    SessionService,
    RateLimiterService,
  ],
  exports: [
    RedisService,
    CacheService,
    SessionService,
    RateLimiterService,
  ],
})
export class RedisModule {}