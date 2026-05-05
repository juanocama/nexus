import { IsString, IsNumber, IsNotEmpty, IsOptional, IsDateString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateTripDto {
  @ApiProperty({ example: 'Centro Comercial Fontanar' })
  @IsString()
  @IsNotEmpty()
  origin_name: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  origin_lat: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  origin_lng: number;

  @ApiProperty({ example: 'Universidad de La Sabana' })
  @IsString()
  @IsNotEmpty()
  destination_name: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  destination_lat: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  destination_lng: number;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  departure_time: string;

  @ApiProperty({ example: 4 })
  @IsNumber()
  @Min(1)
  @Max(7)
  @IsNotEmpty()
  @Type(() => Number)
  total_seats: number;

  @ApiProperty({ example: 8000 })
  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  @Type(() => Number)
  price: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class SearchTripsDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  origin?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  destination?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  date?: string;

  @ApiProperty({ required: false, example: 2 })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  seats?: number;
}
