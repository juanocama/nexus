import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { TripsService } from './trips.service';
import { CreateTripDto, SearchTripsDto } from './dto/trip.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('trips')
@ApiBearerAuth()
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

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createTripDto: CreateTripDto, @Req() req: any) {
    return this.tripsService.create(createTripDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/cancel')
  async cancelTrip(@Param('id') id: string, @Req() req: any) {
    return this.tripsService.cancelTrip(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('driver/my')
  async findMyTrips(@Req() req: any) {
    return this.tripsService.findByDriver(req.user.id);
  }
}
