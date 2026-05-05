import { IsEmail, IsString, MinLength, IsNotEmpty, IsArray, IsEnum, ArrayNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export type UserRoleType = 'driver' | 'passenger';

export class RegisterDto {
  @ApiProperty({ example: 'usuario@unisabana.edu.co' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*\d)/, {
    message: 'Contraseña debe contener al menos una letra mayúscula y un número',
  })
  @IsNotEmpty()
  password: string;

  @ApiProperty({ example: 'Ingenieria' })
  @IsString()
  faculty?: string;

  @ApiProperty({ example: '+573001234567' })
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Roles para el usuario: driver, passenger, or both',
    example: ['driver', 'passenger'],
    isArray: true,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(['driver', 'passenger'], { each: true })
  roles: UserRoleType[];
}
