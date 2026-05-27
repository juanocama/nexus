import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ReportType } from '../report.entity';

export class CreateReportDto {
  @IsEnum(['bug', 'suggestion', 'other'])
  type: ReportType;

  @IsString()
  @MinLength(3)
  @MaxLength(255)
  title: string;

  @IsString()
  @MinLength(10)
  description: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  device_info?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  app_version?: string;
}
