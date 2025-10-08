import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { User } from '../../entities/user.entity';
import { AuthService } from './services/auth.service';
import { JwtTokenService } from './services/jwt-token.service';
import { AuthController } from './controllers/auth.controller';
import { UserService } from '../user/services/user.service';
import { RedisService } from '../redis/redis.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: '15m',
                },
            }),
        }),
        ConfigModule,
    ],
    controllers: [AuthController],
    providers: [
        AuthService,
        JwtTokenService,
        JwtStrategy,
        JwtAuthGuard,
        UserService,
        RedisService,
    ],
    exports: [AuthService, JwtTokenService, JwtAuthGuard, JwtStrategy],
})
export class AuthModule {}
