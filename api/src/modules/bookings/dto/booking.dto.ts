import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  trip_id: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  meeting_point_name?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  meeting_point_lat?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  meeting_point_lng?: number;
}
