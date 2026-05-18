import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../../database/entities/booking.entity';
import { Trip } from '../../database/entities/trip.entity';
import { CreateBookingDto } from './dto/booking.dto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
    @InjectRepository(Trip)
    private tripsRepository: Repository<Trip>,
  ) {}

  private sanitizeBookingUsers<T extends Booking | Booking[]>(bookingOrBookings: T): T {
    const bookings = Array.isArray(bookingOrBookings) ? bookingOrBookings : [bookingOrBookings];

    for (const booking of bookings) {
      const passenger = booking.passenger as any;
      const driver = booking.trip?.driver as any;

      for (const user of [passenger, driver]) {
        if (!user) continue;
        delete user.password_hash;
        delete user.ms_graph_token;
        delete user.refresh_token;
      }
    }

    return bookingOrBookings;
  }

  async create(createDto: CreateBookingDto, passengerId: string): Promise<Booking> {
    const trip = await this.tripsRepository.findOne({ where: { id: createDto.trip_id } });

    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    if (trip.driver_id === passengerId) {
      throw new BadRequestException('Cannot book your own trip');
    }

    if (trip.available_seats <= 0) {
      throw new BadRequestException('No available seats');
    }

    if (trip.status !== 'scheduled') {
      throw new BadRequestException('Trip is not available for booking');
    }

    const existingBooking = await this.bookingsRepository.findOne({
      where: { trip: { id: createDto.trip_id }, passenger: { id: passengerId } },
    });

    if (existingBooking && existingBooking.status !== 'cancelled') {
      throw new BadRequestException('You already have a booking for this trip');
    }

    if (existingBooking && existingBooking.status === 'cancelled') {
      existingBooking.status = 'confirmed';
      existingBooking.meeting_point_name = createDto.meeting_point_name || null;
      existingBooking.meeting_point_lat = createDto.meeting_point_lat || null;
      existingBooking.meeting_point_lng = createDto.meeting_point_lng || null;
      return this.bookingsRepository.save(existingBooking);
    }

    const booking = this.bookingsRepository.create({
      trip: { id: createDto.trip_id },
      passenger: { id: passengerId },
      status: 'confirmed',
      meeting_point_name: createDto.meeting_point_name || null,
      meeting_point_lat: createDto.meeting_point_lat || null,
      meeting_point_lng: createDto.meeting_point_lng || null,
    });

    return this.bookingsRepository.save(booking);
  }

  async findByPassenger(passengerId: string): Promise<Booking[]> {
    const bookings = await this.bookingsRepository.find({
      where: { passenger: { id: passengerId } },
      relations: ['trip', 'trip.driver', 'payment'],
      order: { booked_at: 'DESC' },
    });

    return this.sanitizeBookingUsers(bookings);
  }

  async findByDriver(driverId: string): Promise<Booking[]> {
    const bookings = await this.bookingsRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.trip', 'trip')
      .leftJoinAndSelect('booking.passenger', 'passenger')
      .where('trip.driver_id = :driverId', { driverId })
      .orderBy('booking.booked_at', 'DESC')
      .getMany();

    return this.sanitizeBookingUsers(bookings);
  }

  async findById(id: string): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({
      where: { id },
      relations: ['trip', 'trip.driver', 'passenger', 'payment'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return this.sanitizeBookingUsers(booking);
  }

  async cancelBooking(id: string, userId: string): Promise<Booking> {
    const booking = await this.findById(id);

    if (booking.passenger.id !== userId && booking.trip.driver.id !== userId) {
      throw new BadRequestException('Unauthorized to cancel this booking');
    }

    await this.bookingsRepository.update(id, { status: 'cancelled' });
    return this.findById(id);
  }

  async confirmBooking(id: string, driverId: string): Promise<Booking> {
    const booking = await this.findById(id);

    if (booking.trip.driver.id !== driverId) {
      throw new BadRequestException('Only the driver can confirm bookings');
    }

    await this.bookingsRepository.update(id, { status: 'confirmed' });
    return this.findById(id);
  }
}
