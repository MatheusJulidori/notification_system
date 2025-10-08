import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ 
    example: 'john_doe',
    description: 'The username used to login',
    uniqueItems: true
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ 
    example: 'john.doe@example.com',
    description: 'The email of the user',
    uniqueItems: true
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
  
  @ApiProperty({ 
    example: 'password123',
    description: "User's password. Must contain lowercase, uppercase, numbers and special characters.",
    minLength: 8
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({
    example: 'password123',
    description: "Repeat the user's password",
    minLength: 8
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  repeatPassword: string;
  
  @ApiProperty({ example: '+1 (123) 456-7890',
    description: 'The phone number of the user. Format is +[country code][area code][phone number]',
    uniqueItems: true
  })
  @IsString()
  @IsOptional()
  phone: string;
}