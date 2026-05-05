import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@Param('id') id: string) {
    // This will be overridden by request.user in a real implementation
    return this.usersService.getProfile(id);
  }

  @Get()
  async getAll() {
    return this.usersService.getAll();
  }

  @Put(':id')
  async updateProfile(
    @Param('id') id: string,
    @Body() updateData: Partial<any>,
  ) {
    return this.usersService.updateProfile(id, updateData);
  }
}
