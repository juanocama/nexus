import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVehicleDto {
  @ApiProperty({ example: 'Mazda' })
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiProperty({ example: '3' })
  @IsString()
  @IsNotEmpty()
  model: string;

  @ApiProperty({ example: 'Blanco' })
  @IsString()
  @IsNotEmpty()
  color: string;

  @ApiProperty({ example: 'ABC-123' })
  @IsString()
  @IsNotEmpty()
  plate: string;
}

export class UpdateVehicleDto {
  @ApiProperty({ required: false, example: 'Mazda' })
  @IsString()
  @IsOptional()
  brand?: string;

  @ApiProperty({ required: false, example: '3' })
  @IsString()
  @IsOptional()
  model?: string;

  @ApiProperty({ required: false, example: 'Blanco' })
  @IsString()
  @IsOptional()
  color?: string;

  @ApiProperty({ required: false, example: 'ABC-123' })
  @IsString()
  @IsOptional()
  plate?: string;
}
