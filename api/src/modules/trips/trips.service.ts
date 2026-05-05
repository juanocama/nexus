import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip } from '../../database/entities/trip.entity';
import { User } from '../../database/entities/user.entity';
import { CreateTripDto, SearchTripsDto } from './dto/trip.dto';

@Injectable()
export class TripsService {
  constructor(
    @InjectRepository(Trip)
    private tripsRepository: Repository<Trip>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createTripDto: CreateTripDto, driverId: string): Promise<Trip> {
    const driver = await this.usersRepository.findOne({ where: { id: driverId } });
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }

    const trip = this.tripsRepository.create({
      ...createTripDto,
      driver: { id: driverId },
      available_seats: createTripDto.total_seats,
    });

    return this.tripsRepository.save(trip);
  }

  async findAll(searchDto?: SearchTripsDto): Promise<Trip[]> {
    const queryBuilder = this.tripsRepository
      .createQueryBuilder('trip')
      .leftJoinAndSelect('trip.driver', 'driver')
      .where('trip.status = :status', { status: 'scheduled' });

    if (searchDto?.origin) {
      queryBuilder.andWhere('LOWER(trip.origin_name) LIKE LOWER(:origin)', {
        origin: `%${searchDto.origin}%`,
      });
    }

    if (searchDto?.destination) {
      queryBuilder.andWhere('LOWER(trip.destination_name) LIKE LOWER(:dest)', {
        dest: `%${searchDto.destination}%`,
      });
    }

    if (searchDto?.date) {
      const searchDate = new Date(searchDto.date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      queryBuilder.andWhere('trip.departure_time >= :start AND trip.departure_time < :end', {
        start: searchDate,
        end: nextDay,
      });
    }

    if (searchDto?.seats) {
      queryBuilder.andWhere('trip.available_seats >= :seats', { seats: searchDto.seats });
    }

    queryBuilder.orderBy('trip.departure_time', 'ASC');

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Trip> {
    const trip = await this.tripsRepository.findOne({
      where: { id },
      relations: ['driver'],
    });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    return trip;
  }

  async findByDriver(driverId: string): Promise<Trip[]> {
    return this.tripsRepository.find({
      where: { driver: { id: driverId } },
      relations: ['driver'],
      order: { departure_time: 'DESC' },
    });
  }

  async updateStatus(id: string, status: string, userId: string): Promise<Trip> {
    const trip = await this.findOne(id);

    if (trip.driver.id !== userId) {
      throw new UnauthorizedException('You can only update your own trips');
    }

    await this.tripsRepository.update(id, { status: status as any });
    return this.findOne(id);
  }

  async cancelTrip(id: string, userId: string): Promise<Trip> {
    return this.updateStatus(id, 'cancelled', userId);
  }
}
