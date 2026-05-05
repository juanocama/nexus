import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../database/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { MicrosoftAuthDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  private readonly INSTITUTIONAL_DOMAIN = '@unisabana.edu.co';

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  validateInstitutionalDomain(email: string): boolean {
    return email.toLowerCase().endsWith(this.INSTITUTIONAL_DOMAIN);
  }

  async register(registerDto: RegisterDto) {
    if (!this.validateInstitutionalDomain(registerDto.email)) {
      throw new BadRequestException('Only @unisabana.edu.co emails are allowed');
    }

    const existingUser = await this.usersRepository.findOne({
      where: { email: registerDto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = this.usersRepository.create({
      email: registerDto.email.toLowerCase(),
      full_name: registerDto.full_name,
      password_hash: hashedPassword,
      faculty: registerDto.faculty || null,
      phone: registerDto.phone || null,
    });

    const savedUser = await this.usersRepository.save(user);
    const tokens = await this.generateTokens(savedUser);

    return {
      ...this.sanitizeUser(savedUser),
      ...tokens,
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return null;
    }

    if (!user.password_hash) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async login(email: string, password: string) {
    if (!this.validateInstitutionalDomain(email)) {
      throw new BadRequestException('Only @unisabana.edu.co emails are allowed');
    }

    const user = await this.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is suspended or deactivated');
    }

    const tokens = await this.generateTokens(user);

    return {
      ...this.sanitizeUser(user),
      ...tokens,
    };
  }

  async authenticateWithMicrosoft(dto: MicrosoftAuthDto) {
    const email = await this.verifyMicrosoftToken(dto.accessToken);

    if (!this.validateInstitutionalDomain(email)) {
      throw new BadRequestException('Only @unisabana.edu.co emails are allowed');
    }

    let user = await this.usersRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      user = this.usersRepository.create({
        email: email.toLowerCase(),
        full_name: email.split('@')[0],
        ms_graph_token: dto.accessToken,
        refresh_token: dto.refreshToken || null,
      });
      user = await this.usersRepository.save(user);
    } else {
      await this.usersRepository.update(user.id, {
        ms_graph_token: dto.accessToken,
        refresh_token: dto.refreshToken || user.refresh_token,
      });
    }

    const tokens = await this.generateTokens(user);

    return {
      ...this.sanitizeUser(user),
      ...tokens,
    };
  }

  async verifyEmailDomain(email: string): Promise<{ valid: boolean; registered: boolean }> {
    const isDomainValid = this.validateInstitutionalDomain(email);

    if (!isDomainValid) {
      return { valid: false, registered: false };
    }

    const user = await this.usersRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    return {
      valid: true,
      registered: !!user,
    };
  }

  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_EXPIRATION || '7d',
    });

    return {
      accessToken,
      expiresIn: 7 * 24 * 60 * 60 * 1000,
    };
  }

  private sanitizeUser(user: User) {
    const { password_hash, ms_graph_token, refresh_token, ...sanitized } = user;
    return {
      ...sanitized,
      average_rating: Number(user.average_rating),
      total_trips: user.total_trips,
    };
  }

  private async verifyMicrosoftToken(accessToken: string): Promise<string> {
    // TODO: Implement Microsoft Graph API token verification
    // when CLIENT_ID is available from Azure AD
    // For now, return a mock email for testing
    const email = 'mockuser@unisabana.edu.co';
    return email;
  }
}
