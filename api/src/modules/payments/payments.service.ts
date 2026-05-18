import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MercadoPagoConfig, Preference } from 'mercadopago';

import { Payment, PaymentStatus } from '../../database/entities/payment.entity';
import { Booking } from '../../database/entities/booking.entity';
import { CreatePaymentPreferenceDto, VerifyPaymentDto } from './dto/payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,

    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
  ) {}

  private buildMercadoPagoPreference(): Preference {
    if (!process.env.MP_ACCESS_TOKEN) {
      throw new InternalServerErrorException('Mercado Pago access token is not configured');
    }

    const client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN,
    });

    return new Preference(client);
  }

  async createPreference(
    createDto: CreatePaymentPreferenceDto,
    user: { id: string; email?: string },
  ): Promise<{ checkout_url: string; sandbox_url: string; preference_id: string }> {
    const booking = await this.bookingsRepository.findOne({
      where: { id: createDto.booking_id },
      relations: ['trip', 'passenger'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.passenger_id !== user?.id) {
      throw new ForbiddenException('Booking does not belong to the authenticated user');
    }

    if (booking.status !== 'confirmed') {
      throw new BadRequestException('Only confirmed bookings can be paid');
    }

    if (new Date(booking.trip.departure_time).getTime() <= Date.now()) {
      throw new BadRequestException('Past trips cannot be paid');
    }

    const existingPayment = await this.paymentsRepository.findOne({
      where: { booking_id: createDto.booking_id },
    });

    if (existingPayment?.status === 'success') {
      throw new BadRequestException('Booking already paid');
    }

    if (!user.email) {
      throw new InternalServerErrorException('Authenticated user email is required to create payment preference');
    }

    const preferenceClient = this.buildMercadoPagoPreference();
    const frontendUrl = process.env.FRONTEND_URL?.trim();
    if (!frontendUrl) {
      throw new InternalServerErrorException('FRONTEND_URL is required to build Mercado Pago return URLs');
    }

    const backUrls = {
      success: `${frontendUrl}/payment/success`,
      failure: `${frontendUrl}/payment/failure`,
      pending: `${frontendUrl}/payment/pending`,
    };

    const preferenceBody: any = {
      items: [
        {
          id: booking.id,
          title: `Pago viaje Nexus`,
          quantity: 1,
          currency_id: 'COP',
          unit_price: Number(booking.trip.price),
        },
      ],
      payer: {
        email: process.env.MP_TEST_USER_EMAIL ?? 'test_user_7476469557162763598@testuser.com',
      },
      binary_mode: true,
      external_reference: booking.id,
    };

    const isHttpsFrontend = frontendUrl.toLowerCase().startsWith('https://');
    if (isHttpsFrontend) {
      preferenceBody.back_urls = backUrls;
      preferenceBody.auto_return = 'approved';
    } else {
      console.warn('Mercado Pago auto_return requires HTTPS on FRONTEND_URL. Preference will be created without auto_return.');
      preferenceBody.back_urls = backUrls;
    }

    let result: any;
    try {
      result = await preferenceClient.create({
        body: preferenceBody,
      });
    } catch (error: any) {
      const detail = error?.message || JSON.stringify(error);
      console.error('Failed to create Mercado Pago preference:', detail);
      throw new InternalServerErrorException('Failed to create Mercado Pago preference');
    }

    const preferenceId = result.id ?? result.body?.id;
    const checkoutUrl = result.init_point ?? result.body?.init_point;
    const sandboxUrl = result.sandbox_init_point ?? result.body?.sandbox_init_point;

    if (!preferenceId || !checkoutUrl || !sandboxUrl) {
      throw new InternalServerErrorException('Mercado Pago returned invalid preference response');
    }

    const providerResponse = result.body ?? result;

    await this.paymentsRepository.upsert(
      {
        booking_id: booking.id,
        amount: Number(booking.trip.price),
        method: 'card',
        status: 'pending',
        provider_reference: preferenceId,
        provider_response: providerResponse,
        paid_at: null,
      },
      ['booking_id'],
    );

    return {
      checkout_url: checkoutUrl,
      sandbox_url: sandboxUrl,
      preference_id: preferenceId,
    };
  }

  async verifyPayment(
    verifyDto: VerifyPaymentDto,
    user: { id: string; email?: string },
  ): Promise<{ payment_status: PaymentStatus; paid_at: Date | null }> {
    const payment = await this.paymentsRepository.findOne({
      where: { booking_id: verifyDto.external_reference },
      relations: ['booking'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.booking.passenger_id !== user?.id) {
      throw new ForbiddenException('Booking does not belong to the authenticated user');
    }

    if (verifyDto.preference_id && payment.status !== 'success') {
      payment.provider_reference = verifyDto.preference_id;
    }

    payment.provider_response = {
      ...(payment.provider_response ?? {}),
      external_reference: verifyDto.external_reference,
      preference_id: verifyDto.preference_id,
      collection_status: verifyDto.collection_status,
      verified_at: new Date().toISOString(),
    };

    const status = verifyDto.collection_status?.toLowerCase();
    if (status === 'approved') {
      payment.status = 'success';
      payment.paid_at = payment.paid_at ?? new Date();
    } else if (status === 'pending' && payment.status !== 'success') {
      payment.status = 'pending';
    } else if (status && payment.status !== 'success') {
      payment.status = 'failed';
    }

    await this.paymentsRepository.save(payment);

    return {
      payment_status: payment.status,
      paid_at: payment.paid_at,
    };
  }

  async findByBooking(bookingId: string): Promise<Payment | null> {
    return this.paymentsRepository.findOne({
      where: {
        booking_id: bookingId,
      },
    });
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentsRepository.find({
      relations: ['booking'],
      order: {
        created_at: 'DESC',
      },
    });
  }
}
