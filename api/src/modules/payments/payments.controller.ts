import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  Get,
  Delete,
  Param,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/roles.guard';
import { Roles } from '../../common/roles.decorator';
import { CreatePaymentPreferenceDto, VerifyPaymentDto } from './dto/payment.dto';
import { AddPaymentCardDto, PayWithSavedCardDto, SetDefaultPaymentCardDto } from './dto/payment-card.dto';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-preference')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('passenger')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear preferencia de pago de Mercado Pago para una reserva' })
  @ApiResponse({
    status: 201,
    description: 'Preferencia creada correctamente',
    schema: {
      example: {
        checkout_url: 'https://www.mercadopago.com/checkout/v1/redirect?pref_id=123',
        sandbox_url: 'https://www.mercadopago.com/checkout/v1/redirect?pref_id=123&sandbox=true',
        preference_id: '123',
      },
    },
  })
  async createPreference(@Body() createDto: CreatePaymentPreferenceDto, @Req() req: any) {
    return this.paymentsService.createPreference(createDto, req.user);
  }

  @Post('verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('passenger')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verificar el estado de un pago luego de redireccionar desde Mercado Pago' })
  @ApiResponse({ status: 200, description: 'Pago verificado correctamente' })
  async verifyPayment(@Body() verifyDto: VerifyPaymentDto, @Req() req: any) {
    return this.paymentsService.verifyPayment(verifyDto, req.user);
  }

  @Post('pay-with-card')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('passenger')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pagar una reserva usando una tarjeta guardada' })
  async payWithSavedCard(@Body() payDto: PayWithSavedCardDto, @Req() req: any) {
    return this.paymentsService.payWithSavedCard(payDto, req.user);
  }

  @Get('cards')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar tarjetas guardadas del usuario autenticado' })
  async listCards(@Req() req: any) {
    return this.paymentsService.listCards(req.user);
  }

  @Post('cards')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Guardar tarjeta tokenizada en Mercado Pago' })
  async addCard(@Body() addDto: AddPaymentCardDto, @Req() req: any) {
    return this.paymentsService.addCard(addDto, req.user);
  }

  @Patch('cards/:id/default')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Marcar una tarjeta como principal' })
  async setDefaultCard(
    @Param('id') id: string,
    @Body() updateDto: SetDefaultPaymentCardDto,
    @Req() req: any,
  ) {
    return this.paymentsService.setDefaultCard(id, updateDto, req.user);
  }

  @Delete('cards/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una tarjeta guardada' })
  async deleteCard(@Param('id') id: string, @Req() req: any) {
    await this.paymentsService.deleteCard(id, req.user);
    return { deleted: true };
  }
}
