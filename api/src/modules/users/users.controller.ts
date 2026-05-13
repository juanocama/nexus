import { Controller, Get, Put, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('me')
  async getProfile(@Req() req: any) {
    return this.usersService.getProfile(req.user.id);
  }

  @Get('me/frequent-routes')
  async getFrequentRoutes(@Req() req: any) {
    return this.usersService.getFrequentRoutes(req.user.id);
  }

  @Roles('driver', 'passenger')
  @Get()
  async getAll() {
    return this.usersService.getAll();
  }

  @Roles('driver', 'passenger')
  @Put(':id')
  async updateProfile(
    @Param('id') id: string,
    @Body() updateData: Partial<any>,
  ) {
    return this.usersService.updateProfile(id, updateData);
  }

  @Roles('driver', 'passenger')
  @Patch('me/roles')
  async updateMyRoles(@Body('roles') roles: string[], @Req() req: any) {
    const profile = await this.usersService.updateRoles(req.user.id, roles);
    const accessToken = this.jwtService.sign({
      sub: profile.id,
      email: profile.email,
      roles: profile.roles,
    });
    return {
      ...profile,
      accessToken,
    };
  }
}
