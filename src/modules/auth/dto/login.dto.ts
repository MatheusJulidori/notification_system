import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'john_doe',
    description: 'The username used to login',
    uniqueItems: true
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'password123',
    description: 'The password of the user. Must contain lowercase, uppercase, numbers and special characters.',
    minLength: 8
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}