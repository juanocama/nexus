import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'usuario@unisabana.edu.co' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class EmailDto {
  @ApiProperty({ example: 'usuario@unisabana.edu.co' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class MicrosoftAuthDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  accessToken: string;

  @ApiProperty({ required: false })
  @IsString()
  refreshToken?: string;
}
