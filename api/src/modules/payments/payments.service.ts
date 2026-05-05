import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../../database/entities/payment.entity';
import { Booking } from '../../database/entities/booking.entity';
import { CreatePaymentDto } from './dto/payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
  ) {}

  async create(createDto: CreatePaymentDto): Promise<Payment> {
    const booking = await this.bookingsRepository.findOne({
      where: { id: createDto.booking_id },
      relations: ['trip'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.status !== 'confirmed') {
      throw new BadRequestException('Can only pay for confirmed bookings');
    }

    const existingPayment = await this.paymentsRepository.findOne({
      where: { booking: { id: createDto.booking_id } },
    });

    if (existingPayment && existingPayment.status === 'success') {
      throw new BadRequestException('Booking already paid');
    }

    const payment = this.paymentsRepository.create({
      booking: { id: createDto.booking_id },
      amount: Number(booking.trip.price),
      method: createDto.method,
      status: 'success',
      paid_at: new Date(),
    });

    return this.paymentsRepository.save(payment);
  }

  async findByBooking(bookingId: string): Promise<Payment | null> {
    return this.paymentsRepository.findOne({
      where: { booking: { id: bookingId } },
    });
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentsRepository.find({
      relations: ['booking'],
      order: { created_at: 'DESC' },
    });
  }
}
