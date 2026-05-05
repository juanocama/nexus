import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto, EmailDto, MicrosoftAuthDto } from './dto/login.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user with email/password' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid email or user already exists' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('microsoft')
  @ApiOperation({ summary: 'Authenticate with Microsoft 365 (placeholder)' })
  @ApiResponse({ status: 200, description: 'Microsoft auth successful' })
  async microsoftAuth(@Body() dto: MicrosoftAuthDto) {
    return this.authService.authenticateWithMicrosoft(dto);
  }

  @Post('verify-domain')
  @ApiOperation({ summary: 'Verify if email has valid institutional domain' })
  async verifyDomain(@Body() dto: EmailDto) {
    return this.authService.verifyEmailDomain(dto.email);
  }
}
