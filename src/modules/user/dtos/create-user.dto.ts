import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsOptional, IsEnum, IsDate } from 'class-validator';
import { UserStatus } from 'src/common/enums/user';

export class createUserDto {
    @ApiProperty({
        example: 'john_doe',
        description: 'Username user to login',
        uniqueItems: true,
    })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({
        example: 'john.doe@example.com',
        description: 'The email of the user',
        uniqueItems: true,
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: '+1 (123) 456-7890',
        description:
            'The phone number of the user. Format is +[country code][area code][phone number]',
        uniqueItems: true,
    })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiProperty({
        example: 'hashed_password_after_12_round_of_salt',
        description: 'The passoword after being hashed',
    })
    @IsString()
    @IsNotEmpty()
    passwordHash: string;

    @ApiProperty({
        example: UserStatus.INACTIVE,
        description:
            'User status. Default is inactive.',
    })
    @IsEnum(UserStatus)
    @IsNotEmpty()
    status: UserStatus;

    @ApiProperty({
        example: '123456',
        description: 'The activation token',
    })
    @IsString()
    @IsOptional()
    activationToken?: string;

    @ApiProperty({
        example: '2021-01-01T00:00:00.000Z',
        description: 'The activation token expires',
    })
    @IsDate()
    @IsOptional()
    activationTokenExpires?: Date;
}
