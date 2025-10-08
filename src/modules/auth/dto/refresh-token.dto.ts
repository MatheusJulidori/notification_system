import {ApiProperty} from '@nestjs/swagger';
import {IsString, IsNotEmpty} from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ 
    example: 'refresh_token_1234567890',
    description: 'The refresh token used to refresh the access token',
    uniqueItems: true
  })
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}