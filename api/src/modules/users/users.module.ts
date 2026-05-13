import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from '../../database/entities/user.entity';
import { UserRole } from '../../database/entities/user-role.entity';
import { Trip } from '../../database/entities/trip.entity';
import { Booking } from '../../database/entities/booking.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRole, Trip, Booking]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'nexus-secret-key-change-in-production',
      signOptions: {
        expiresIn: process.env.JWT_EXPIRATION || '7d',
      },
    }),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
