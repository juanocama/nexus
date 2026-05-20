import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  MercadoPagoConfig,
  Preference,
  Customer,
  CardToken,
  Payment as MercadoPagoPayment,
} from 'mercadopago';

import { Payment, PaymentStatus } from '../../database/entities/payment.entity';
import { PaymentCard } from '../../database/entities/payment-card.entity';
import { Booking } from '../../database/entities/booking.entity';
import { CreatePaymentPreferenceDto, VerifyPaymentDto } from './dto/payment.dto';
import { AddPaymentCardDto, PayWithSavedCardDto, SetDefaultPaymentCardDto } from './dto/payment-card.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,

    @InjectRepository(PaymentCard)
    private paymentCardsRepository: Repository<PaymentCard>,

    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
  ) {}

  private buildMercadoPagoClient(): MercadoPagoConfig {
    if (!process.env.MP_ACCESS_TOKEN) {
      throw new InternalServerErrorException('Mercado Pago access token is not configured');
    }

    return new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN,
    });
  }

  private buildMercadoPagoPreference(): Preference {
    return new Preference(this.buildMercadoPagoClient());
  }

  private buildMercadoPagoCustomer(): Customer {
    return new Customer(this.buildMercadoPagoClient());
  }

  private buildMercadoPagoCardToken(): CardToken {
    return new CardToken(this.buildMercadoPagoClient());
  }

  private buildMercadoPagoPayment(): MercadoPagoPayment {
    return new MercadoPagoPayment(this.buildMercadoPagoClient());
  }

  private splitFullName(fullName?: string): { first_name?: string; last_name?: string } {
    if (!fullName) return {};

    const [firstName, ...lastName] = fullName.trim().split(/\s+/);
    return {
      first_name: firstName,
      last_name: lastName.length > 0 ? lastName.join(' ') : undefined,
    };
  }

  private mapCard(card: PaymentCard) {
    return {
      id: card.id,
      brand: card.brand,
      payment_type: card.payment_type,
      last_four: card.last_four,
      exp_month: card.exp_month,
      exp_year: card.exp_year,
      cardholder_name: card.cardholder_name,
      is_default: card.is_default,
      created_at: card.created_at,
    };
  }

  private async getOrCreateMercadoPagoCustomer(user: {
    id: string;
    email?: string;
    full_name?: string;
  }): Promise<string> {
    if (!user.email) {
      throw new InternalServerErrorException('Authenticated user email is required to save payment cards');
    }

    const existingCard = await this.paymentCardsRepository.findOne({
      where: { user_id: user.id },
      order: { created_at: 'DESC' },
    });

    if (existingCard?.mp_customer_id) {
      return existingCard.mp_customer_id;
    }

    const customerClient = this.buildMercadoPagoCustomer();
    const found = await customerClient.search({ options: { email: user.email } });
    const existingCustomer = found.results?.find((customer) => customer.email === user.email);

    if (existingCustomer?.id) {
      return existingCustomer.id;
    }

    const createdCustomer = await customerClient.create({
      body: {
        email: user.email,
        ...this.splitFullName(user.full_name),
        description: `Nexus user ${user.id}`,
      },
    });

    if (!createdCustomer.id) {
      throw new InternalServerErrorException('Mercado Pago returned invalid customer response');
    }

    return createdCustomer.id;
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

  async listCards(user: { id: string }) {
    const cards = await this.paymentCardsRepository.find({
      where: { user_id: user.id },
      order: {
        is_default: 'DESC',
        created_at: 'DESC',
      },
    });

    return cards.map((card) => this.mapCard(card));
  }

  async addCard(
    addDto: AddPaymentCardDto,
    user: { id: string; email?: string; full_name?: string },
  ) {
    const customerId = await this.getOrCreateMercadoPagoCustomer(user);
    const customerClient = this.buildMercadoPagoCustomer();
    let cardToken = addDto.card_token;

    if (!cardToken && addDto.dev_card_data) {
      if (process.env.MP_ALLOW_SERVER_CARD_TOKENIZATION !== 'true') {
        throw new BadRequestException('Client-side Mercado Pago card token is required');
      }

      const tokenResponse = await this.buildMercadoPagoCardToken().create({
        body: {
          customer_id: customerId,
          card_number: addDto.dev_card_data.card_number,
          expiration_month: addDto.dev_card_data.expiration_month,
          expiration_year: addDto.dev_card_data.expiration_year,
          security_code: addDto.dev_card_data.security_code,
        },
      });

      cardToken = tokenResponse.id;
    }

    if (!cardToken) {
      throw new BadRequestException('Client-side Mercado Pago card token is required');
    }

    let cardResponse: any;
    try {
      cardResponse = await customerClient.createCard({
        customerId,
        body: {
          token: cardToken,
        },
      });
    } catch (error: any) {
      const detail = error?.message || JSON.stringify(error);
      console.error('Failed to create Mercado Pago customer card:', detail);
      throw new BadRequestException('Mercado Pago could not save the card');
    }

    if (!cardResponse?.id || !cardResponse?.last_four_digits) {
      throw new InternalServerErrorException('Mercado Pago returned invalid card response');
    }

    if (addDto.is_default) {
      await this.paymentCardsRepository.update({ user_id: user.id }, { is_default: false });
    }

    const existingCount = await this.paymentCardsRepository.count({ where: { user_id: user.id } });
    const paymentCard = this.paymentCardsRepository.create({
      user_id: user.id,
      mp_customer_id: customerId,
      mp_card_id: cardResponse.id,
      brand: cardResponse.payment_method?.name ?? cardResponse.payment_method?.id ?? 'Tarjeta',
      payment_type: cardResponse.payment_method?.payment_type_id ?? null,
      last_four: cardResponse.last_four_digits,
      first_six: cardResponse.first_six_digits ?? null,
      exp_month: cardResponse.expiration_month,
      exp_year: cardResponse.expiration_year,
      cardholder_name: cardResponse.cardholder?.name ?? null,
      is_default: addDto.is_default ?? existingCount === 0,
      provider_response: cardResponse,
    });

    const savedCard = await this.paymentCardsRepository.save(paymentCard);

    return this.mapCard(savedCard);
  }

  async payWithSavedCard(
    payDto: PayWithSavedCardDto,
    user: { id: string; email?: string },
  ): Promise<{ payment_status: PaymentStatus; provider_reference: string | null; paid_at: Date | null }> {
    const booking = await this.bookingsRepository.findOne({
      where: { id: payDto.booking_id },
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

    if (!user.email) {
      throw new InternalServerErrorException('Authenticated user email is required to pay');
    }

    const card = await this.paymentCardsRepository.findOne({
      where: { id: payDto.card_id, user_id: user.id },
    });

    if (!card) {
      throw new NotFoundException('Payment card not found');
    }

    const existingPayment = await this.paymentsRepository.findOne({
      where: { booking_id: booking.id },
    });

    if (existingPayment?.status === 'success') {
      throw new BadRequestException('Booking already paid');
    }

    const tokenResponse = await this.buildMercadoPagoCardToken().create({
      body: {
        card_id: card.mp_card_id,
        customer_id: card.mp_customer_id,
        security_code: payDto.security_code,
      },
    });

    if (!tokenResponse.id) {
      throw new InternalServerErrorException('Mercado Pago returned invalid card token response');
    }

    const paymentMethodId = card.provider_response?.payment_method?.id ?? card.brand.toLowerCase();
    const paymentResponse = await this.buildMercadoPagoPayment().create({
      body: {
        token: tokenResponse.id,
        transaction_amount: Number(booking.trip.price),
        installments: payDto.installments ?? 1,
        payment_method_id: paymentMethodId,
        payer: {
          id: card.mp_customer_id,
          email: user.email,
        },
        binary_mode: true,
        external_reference: booking.id,
        description: 'Pago viaje Nexus',
      },
    });

    const paymentStatus = paymentResponse.status === 'approved'
      ? 'success'
      : paymentResponse.status === 'pending' || paymentResponse.status === 'in_process'
        ? 'pending'
        : 'failed';

    const savedPayment = await this.paymentsRepository.save({
      ...(existingPayment ?? {}),
      booking_id: booking.id,
      amount: Number(booking.trip.price),
      method: 'card',
      status: paymentStatus,
      provider_reference: paymentResponse.id ? String(paymentResponse.id) : null,
      provider_response: {
        payment: paymentResponse,
        saved_card_id: card.id,
      },
      paid_at: paymentStatus === 'success' ? new Date() : null,
    });

    return {
      payment_status: savedPayment.status,
      provider_reference: savedPayment.provider_reference,
      paid_at: savedPayment.paid_at,
    };
  }

  async setDefaultCard(
    id: string,
    updateDto: SetDefaultPaymentCardDto,
    user: { id: string },
  ) {
    const card = await this.paymentCardsRepository.findOne({
      where: { id, user_id: user.id },
    });

    if (!card) {
      throw new NotFoundException('Payment card not found');
    }

    if (updateDto.is_default) {
      await this.paymentCardsRepository.update({ user_id: user.id }, { is_default: false });
    }

    card.is_default = updateDto.is_default;
    const savedCard = await this.paymentCardsRepository.save(card);

    return this.mapCard(savedCard);
  }

  async deleteCard(id: string, user: { id: string }) {
    const card = await this.paymentCardsRepository.findOne({
      where: { id, user_id: user.id },
    });

    if (!card) {
      throw new NotFoundException('Payment card not found');
    }

    const customerClient = this.buildMercadoPagoCustomer();
    try {
      await customerClient.removeCard({
        customerId: card.mp_customer_id,
        cardId: card.mp_card_id,
      });
    } catch (error: any) {
      const detail = error?.message || JSON.stringify(error);
      console.error('Failed to remove Mercado Pago customer card:', detail);
      throw new BadRequestException('Mercado Pago could not remove the card');
    }

    await this.paymentCardsRepository.remove(card);

    if (card.is_default) {
      const replacement = await this.paymentCardsRepository.findOne({
        where: { user_id: user.id },
        order: { created_at: 'DESC' },
      });

      if (replacement) {
        replacement.is_default = true;
        await this.paymentCardsRepository.save(replacement);
      }
    }
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
