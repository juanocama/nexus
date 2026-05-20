import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsOptional,
  IsPositive,
  IsString,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DevCardDataDto {
  @IsString()
  @IsNotEmpty()
  card_number: string;

  @IsNumberString()
  expiration_month: string;

  @IsNumberString()
  expiration_year: string;

  @IsString()
  @IsNotEmpty()
  security_code: string;
}

export class AddPaymentCardDto {
  @ApiProperty({
    description: 'Token de tarjeta generado por Mercado Pago en el cliente',
    example: 'card_token_id',
    required: false,
  })
  @ValidateIf((dto) => !dto.dev_card_data)
  @IsString()
  @IsNotEmpty()
  card_token?: string;

  @ApiProperty({
    description: 'Solo para sandbox local cuando MP_ALLOW_SERVER_CARD_TOKENIZATION=true',
    required: false,
  })
  @IsOptional()
  dev_card_data?: DevCardDataDto;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  is_default?: boolean;
}

export class SetDefaultPaymentCardDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  is_default: boolean;
}

export class PayWithSavedCardDto {
  @ApiProperty({ example: 'uuid-of-booking' })
  @IsString()
  @IsNotEmpty()
  booking_id: string;

  @ApiProperty({ example: 'uuid-of-local-saved-card' })
  @IsString()
  @IsNotEmpty()
  card_id: string;

  @ApiProperty({ example: '123' })
  @IsString()
  @IsNotEmpty()
  security_code: string;

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsPositive()
  @IsOptional()
  installments?: number;
}
