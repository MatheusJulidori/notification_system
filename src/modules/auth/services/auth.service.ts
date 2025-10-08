import {
    BadRequestException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserService } from '../../user/services/user.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { AppLoggerService } from '../../../common/services/logger.service';
import { UserStatus } from 'src/common/enums/user';
import { createUserDto } from 'src/modules/user/dtos/create-user.dto';
import { User } from 'src/entities/user.entity';
import { JwtTokenService } from './jwt-token.service';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtTokenService: JwtTokenService,
        private configService: ConfigService,
        private logger: AppLoggerService,
    ) {
        this.logger.setContext(AuthService.name);
    }

    // TODO: Implement email verification. For now, just return token on response
    async register(registerDto: RegisterDto): Promise<{ message: string }> {
        this.logger.logMethodEntry('register', { registerDto });

        const passwordStrength = this.checkPasswordStrength(
            registerDto.password,
        );
        if (!passwordStrength.isValid) {
            this.logger.log(`Password strength check failed`);
            this.logger.logMethodExit('register', {
                message: passwordStrength.message,
            });
            throw new BadRequestException(passwordStrength.message);
        }

        if (registerDto.password !== registerDto.repeatPassword) {
            this.logger.log(`Passwords do not match`);
            this.logger.logMethodExit('register', {
                message: 'Passwords do not match',
            });
            throw new BadRequestException('Passwords do not match');
        }

        const saltRounds =
            this.configService.get<number>('BCRYPT_ROUNDS') || 10;
        const passwordHash = await bcrypt.hash(
            registerDto.password,
            saltRounds,
        );

        const { token, expiresAt } = this.generateActivationToken();

        const userDto: createUserDto = {
            ...registerDto,
            passwordHash,
            status: UserStatus.INACTIVE,
            activationToken: token,
            activationTokenExpires: expiresAt,
        };

        const user = await this.userService.create(userDto);

        await this.sendActivationEmail(user, token);

        this.logger.log(`User registered successfully: ${user.id}`);
        this.logger.logMethodExit('register', {
            message:
                'Account created successfully. Please check your email for activation. (Your token is: ' +
                token +
                ')',
        });
        return {
            message:
                'Account created successfully. Please check your email for activation. (Your token is: ' +
                token +
                ')',
        };
    }

    async activateAccount(token: string): Promise<{ message: string }> {
        this.logger.logMethodEntry('activateAccount', { token });

        const user = await this.userService.findByActivationToken(token);

        if (!user) {
            this.logger.log(`Invalid activation token`);
            this.logger.logMethodExit('activateAccount', {
                message: 'Invalid activation token',
            });
            throw new BadRequestException('Invalid activation token');
        }

        if (
            user.activationTokenExpires &&
            new Date() > user.activationTokenExpires
        ) {
            this.logger.log(`Activation token has expired`);
            this.logger.logMethodExit('activateAccount', {
                message: 'Activation token has expired',
            });
            throw new BadRequestException('Activation token has expired');
        }

        if (user.status === UserStatus.ACTIVE) {
            this.logger.log(`Account is already activated`);
            this.logger.logMethodExit('activateAccount', {
                message: 'Account is already activated',
            });
            throw new BadRequestException('Account is already activated');
        }

        await this.userService.activateUser(user.id);

        this.logger.log(`User activated successfully: ${user.id}`);
        this.logger.logMethodExit('activateAccount', {
            message: 'Account activated successfully. You can now login.',
        });

        return {
            message: 'Account activated successfully. You can now login.',
        };
    }

    async login(loginDto: LoginDto): Promise<{
        access_token: string;
        refresh_token: string;
        expires_in: number;
    }> {
        this.logger.logMethodEntry('login', { loginDto });

        const user = await this.validateUser(
            loginDto.username,
            loginDto.password,
        );

        if (!user) {
            this.logger.log(`Invalid credentials`);
            this.logger.logMethodExit('login', {
                message: 'Invalid credentials',
            });
            throw new UnauthorizedException('Invalid credentials');
        }

        if (user.status === UserStatus.INACTIVE) {
            this.logger.log(
                `User is not active. Please activate your account first.`,
            );
            this.logger.logMethodExit('login', {
                message:
                    'User is not active. Please activate your account first.',
            });
            throw new UnauthorizedException(
                'User is not active. Please activate your account first.',
            );
        }

        if (user.status === UserStatus.SUSPENDED) {
            this.logger.log(
                `Your account has been suspended. Please contact support.`,
            );
            this.logger.logMethodExit('login', {
                message:
                    'Your account has been suspended. Please contact support.',
            });
            throw new UnauthorizedException(
                'Your account has been suspended. Please contact support.',
            );
        }

        const tokens = await this.jwtTokenService.generateTokenPair(user);

        this.logger.log(`User logged in successfully: ${user.id}`);
        this.logger.logMethodExit('login', { tokens });

        return tokens;
    }

    async refreshToken(refreshToken: string): Promise<{
        access_token: string;
        refresh_token: string;
        expires_in: number;
    }> {
        this.logger.logMethodEntry('refreshToken', { refreshToken });

        const userId =
            await this.jwtTokenService.validateRefreshToken(refreshToken);

        const user = await this.userService.findById(userId);
        if (!user) {
            this.logger.log(`User not found`);
            this.logger.logMethodExit('refreshToken', {
                message: 'User not found',
            });
            throw new UnauthorizedException('User not found');
        }

        if (user.status !== UserStatus.ACTIVE) {
            this.logger.log(`Inactive user tried to refresh token: ${user.id}`);
            throw new UnauthorizedException('Account is not active');
        }

        await this.jwtTokenService.revokeRefreshToken(refreshToken);

        const tokens = await this.jwtTokenService.generateTokenPair(user);

        this.logger.log(`Token refreshed successfully for user: ${user.id}`);
        this.logger.logMethodExit('refreshToken', { tokens });

        return tokens;
    }

    async logout(refreshToken: string): Promise<{ message: string }> {
        this.logger.logMethodEntry('logout', { refreshToken });

        await this.jwtTokenService.revokeRefreshToken(refreshToken);

        this.logger.log(`Logged out successfully`);
        this.logger.logMethodExit('logout', {
            message: 'Logged out successfully',
        });
        return {
            message: 'Logged out successfully',
        };
    }

    private async validateUser(
        username: string,
        password: string,
    ): Promise<User | null> {
        this.logger.logMethodEntry('validateUser', { username, password });

        const user = await this.userService.findByUsername(username);

        if (!user) {
            this.logger.log(`User not found`);
            this.logger.logMethodExit('validateUser', {
                message: 'Invalid credentials',
            });
            return null;
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.passwordHash,
        );

        if (!isPasswordValid) {
            this.logger.log(`Invalid password`);
            this.logger.logMethodExit('validateUser', {
                message: 'Invalid credentials',
            });
            return null;
        }

        this.logger.log(`User validated successfully`);
        this.logger.logMethodExit('validateUser', { user });

        return user;
    }

    private async sendActivationEmail(
        user: User,
        token: string,
    ): Promise<void> {
        this.logger.logMethodEntry('sendActivationEmail', { user, token });
        // TODO: Implement send activation email

        const baseUrl =
            this.configService.get('API_URL') || 'http://localhost:4001';
        const apiPrefix = this.configService.get('API_PREFIX') || '/api/v1';
        const activationUrl = `${baseUrl}${apiPrefix}/auth/register/activate?token=${token}`;

        this.logger.log(`Activation token for ${user.email}: ${token}`);
        this.logger.log(`Activation URL: ${activationUrl}`);

        this.logger.log(`Activation token set successfully`);
        this.logger.logMethodExit('sendActivationEmail', { user, token });
    }

    private generateActivationToken(): { token: string; expiresAt: Date } {
        this.logger.logMethodEntry('generateActivationToken');

        const token = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        this.logger.log(`Activation token generated successfully`);
        this.logger.logMethodExit('generateActivationToken', {
            token,
            expiresAt,
        });

        return { token, expiresAt };
    }

    private checkPasswordStrength(password: string): {
        isValid: boolean;
        message: string;
    } {
        this.logger.logMethodEntry('checkPasswordStrength', { password });
        if (password.length < 8) {
            return {
                isValid: false,
                message: 'Password must be at least 8 characters long',
            };
        }
        if (!/[A-Z]/.test(password)) {
            return {
                isValid: false,
                message: 'Password must contain at least one uppercase letter',
            };
        }
        if (!/[a-z]/.test(password)) {
            return {
                isValid: false,
                message: 'Password must contain at least one lowercase letter',
            };
        }
        if (!/[0-9]/.test(password)) {
            return {
                isValid: false,
                message: 'Password must contain at least one number',
            };
        }
        if (!/[!@#$%^&*]/.test(password)) {
            return {
                isValid: false,
                message: 'Password must contain at least one special character',
            };
        }
        this.logger.log(`Password strength check passed`);
        this.logger.logMethodExit('checkPasswordStrength', {
            isValid: true,
            message: 'Password strength check passed',
        });
        return { isValid: true, message: 'Ok' };
    }
}
