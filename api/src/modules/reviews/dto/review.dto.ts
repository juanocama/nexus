import { IsString, IsNumber, IsOptional, IsNotEmpty, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateReviewDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  trip_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  reviewed_user_id: string;

  @ApiProperty({ minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  @Type(() => Number)
  rating: number;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}
