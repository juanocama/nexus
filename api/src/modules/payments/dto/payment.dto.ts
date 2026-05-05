import { IsString, IsNumber, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePaymentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  booking_id: string;

  @ApiProperty({ example: 'card', enum: ['pse', 'card', 'sabana_points'] })
  @IsEnum(['pse', 'card', 'sabana_points'])
  @IsNotEmpty()
  method: 'pse' | 'card' | 'sabana_points';
}
