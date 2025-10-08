import { Controller, Post, Body, UseGuards, Req, Query, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  register(@Body() registerDto: RegisterDto): Promise<{ message: string }> {
    return this.authService.register(registerDto);
  }

  @Get('register/activate')
  @ApiOperation({ summary: 'Activate user' })
  activateUser(@Query('token') token: string): Promise<{ message: string }> {
    return this.authService.activateAccount(token);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  login(@Body() loginDto: LoginDto): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  refreshToken(@Body('refresh_token') refreshToken: string): Promise<{ access_token: string; refresh_token: string; expires_in: number }> {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout user' })
  logout(@Body('refresh_token') refreshToken: string): Promise<{ message: string }> {
    return this.authService.logout(refreshToken);
  }
}