import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TripsService } from './trips.service';
import { CreateTripDto, SearchTripsDto, UpdateTripDto } from './dto/trip.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';

@ApiTags('trips')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('trips')
export class TripsController {
  constructor(private readonly tripsService: TripsService) {}

  @Get()
  async findAll(@Query() searchDto: SearchTripsDto) {
    return this.tripsService.findAll(searchDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tripsService.findOne(id);
  }

  @Roles('driver')
  @Post()
  async create(@Body() createTripDto: CreateTripDto, @Req() req: any) {
    return this.tripsService.create(createTripDto, req.user.id);
  }

  @Roles('driver')
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateTripDto: UpdateTripDto, @Req() req: any) {
    return this.tripsService.update(id, updateTripDto, req.user.id);
  }

  @Roles('driver')
  @Put(':id/cancel')
  async cancelTrip(@Param('id') id: string, @Req() req: any) {
    return this.tripsService.cancelTrip(id, req.user.id);
  }

  @Roles('driver')
  @Get('driver/my')
  async findMyTrips(@Req() req: any) {
    return this.tripsService.findByDriver(req.user.id);
  }
}
