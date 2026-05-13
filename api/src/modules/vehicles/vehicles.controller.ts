import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto, UpdateVehicleDto } from './dto/vehicle.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';

@ApiTags('vehicles')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Roles('driver')
  @Post()
  async create(@Body() createVehicleDto: CreateVehicleDto, @Req() req: any) {
    return this.vehiclesService.create(createVehicleDto, req.user.id);
  }

  @Roles('driver')
  @Get()
  async findMyVehicles(@Req() req: any) {
    return this.vehiclesService.findByDriver(req.user.id);
  }

  @Roles('driver')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Roles('driver')
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto, @Req() req: any) {
    return this.vehiclesService.update(id, updateVehicleDto, req.user.id);
  }

  @Roles('driver')
  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.vehiclesService.remove(id, req.user.id);
    return { message: 'Vehicle deleted' };
  }
}
