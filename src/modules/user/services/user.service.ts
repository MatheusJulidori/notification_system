import {
    Injectable,
    ConflictException,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DatabaseService } from '../../database/database.service';
import { AppLoggerService } from '../../../common/services/logger.service';
import { createUserDto } from '../dtos/create-user.dto';
import { User } from '../../../entities/user.entity';
import { UserStatus } from '../../../common/enums/user';
import {
    validatePhoneNumber,
    formatToE164,
} from '../../../common/utils/phone-number.util';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly databaseService: DatabaseService,
        private readonly logger: AppLoggerService,
    ) {
        this.logger.setContext(UserService.name);
    }

    async create(createUserDto: createUserDto): Promise<User> {
        this.logger.logMethodEntry('create', {
            username: createUserDto.username,
            email: createUserDto.email,
        });

        const formattedUsername = createUserDto.username.trim().toLowerCase();
        const isUsernameAvailable =
            await this.checkUsernameAvailability(formattedUsername);
        if (!isUsernameAvailable) {
            throw new ConflictException('Username already exists');
        }

        const formattedEmail = createUserDto.email.trim().toLowerCase();
        const isEmailAvailable =
            await this.checkEmailAvailability(formattedEmail);
        if (!isEmailAvailable) {
            throw new ConflictException('Email already exists');
        }

        let formattedPhone: string | undefined = undefined;
        if (createUserDto.phone && createUserDto.phone.trim() !== '') {
            const phoneValidation = validatePhoneNumber(createUserDto.phone);

            if (!phoneValidation.isValid) {
                throw new BadRequestException(
                    `Invalid phone number: ${phoneValidation.message}`,
                );
            }

            const e164Phone = formatToE164(createUserDto.phone);

            if (!e164Phone) {
                throw new BadRequestException(
                    'Could not format phone number to E.164 format',
                );
            }

            formattedPhone = e164Phone;

            const isPhoneAvailable =
                await this.checkPhoneAvailability(formattedPhone);

            if (!isPhoneAvailable) {
                throw new ConflictException('Phone number already used');
            }

            this.logger.log(
                `Phone formatted: ${formattedPhone} (Country: ${phoneValidation.country})`,
            );
        }

        const user = this.userRepository.create({
            ...createUserDto,
            username: formattedUsername,
            email: formattedEmail,
            phone: formattedPhone,
        });
        const savedUser = await this.userRepository.save(user);

        this.logger.logDatabaseOperation('INSERT', 'User', {
            id: savedUser.id,
            username: savedUser.username,
            email: savedUser.email,
            phone: savedUser.phone,
            createdAt: savedUser.createdAt,
            updatedAt: savedUser.updatedAt,
            activationToken: savedUser.activationToken,
            activationTokenExpires: savedUser.activationTokenExpires,
            status: savedUser.status,
        });

        this.logger.log(`User created successfully: ${savedUser.id}`);
        this.logger.logMethodExit('create', { userId: savedUser.id });

        return savedUser;
    }

    async findById(id: string): Promise<User> {
        this.logger.logMethodEntry('findById', { id });
        const user = await this.userRepository.findOne({
            where: { id },
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        this.logger.logDatabaseOperation('SELECT', 'User', { id });
        this.logger.log(`User found: ${user.id}`);
        this.logger.logMethodExit('findById', { user });
        return user;
    }

    async findByUsername(username: string): Promise<User | null> {
        this.logger.logMethodEntry('findByUsername', { username });
        const user = await this.userRepository.findOne({
            where: { username },
        });
        if (!user) {
            this.logger.log('No user found with username');
            return null;
        }
        this.logger.logDatabaseOperation('SELECT', 'User', { username });
        this.logger.log(`User found: ${user.username}`);
        this.logger.logMethodExit('findByUsername', { user });

        return user;
    }

    async findByActivationToken(token: string): Promise<User | null> {
        this.logger.logMethodEntry('findByActivationToken', { token });
        const user = await this.userRepository.findOne({
            where: { activationToken: token },
        });
        if (!user) {
            this.logger.log('No user found with activation token');
            return null;
        }
        this.logger.logDatabaseOperation('SELECT', 'User', { token });
        this.logger.log(`User found: ${user.id}`);
        this.logger.logMethodExit('findByActivationToken', { user });
        return user;
    }

    async activateUser(id: string): Promise<void> {
        this.logger.logMethodEntry('activateUser', { id });
        await this.userRepository.update(id, {
            status: UserStatus.ACTIVE,
            activationToken: null,
            activationTokenExpires: null,
        });
        this.logger.log(`User activated successfully: ${id}`);
        this.logger.logMethodExit('activateUser', { id });
    }

    private async checkEmailAvailability(email: string): Promise<boolean> {
        this.logger.logMethodEntry('checkEmailAvailability', { email });
        const queryBuilder = this.databaseService
            .createQueryBuilder()
            .select('user')
            .from(User, 'user')
            .where('user.email = :email', { email });

        const existingUser = await queryBuilder.getOne();
        this.logger.logDatabaseOperation('SELECT', 'User', { email });

        const isAvailable = !existingUser;
        this.logger.log(`Email available: ${isAvailable}`);
        this.logger.logMethodExit('checkEmailAvailability', { isAvailable });
        return isAvailable;
    }

    private async checkPhoneAvailability(phone: string): Promise<boolean> {
        this.logger.logMethodEntry('checkPhoneAvailability', { phone });
        const queryBuilder = this.databaseService
            .createQueryBuilder()
            .select('user')
            .from(User, 'user')
            .where('user.phone = :phone', { phone });

        const existingUser = await queryBuilder.getOne();
        this.logger.logDatabaseOperation('SELECT', 'User', { phone });

        const isAvailable = !existingUser;
        this.logger.log(`Phone available: ${isAvailable}`);
        this.logger.logMethodExit('checkPhoneAvailability', { isAvailable });

        return isAvailable;
    }

    private async checkUsernameAvailability(
        username: string,
    ): Promise<boolean> {
        this.logger.logMethodEntry('checkUsernameAvailability', { username });
        const queryBuilder = this.databaseService
            .createQueryBuilder()
            .select('user')
            .from(User, 'user')
            .where('user.username = :username', { username });

        const existingUser = await queryBuilder.getOne();
        this.logger.logDatabaseOperation('SELECT', 'User', { username });

        const isAvailable = !existingUser;
        this.logger.log(`Username available: ${isAvailable}`);
        this.logger.logMethodExit('checkUsernameAvailability', { isAvailable });

        return isAvailable;
    }
}
