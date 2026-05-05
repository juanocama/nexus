import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Trip } from './trip.entity';
import { User } from './user.entity';
import { Payment } from './payment.entity';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'trip_id' })
  trip_id: string;

  @ManyToOne(() => Trip, (trip) => trip.bookings)
  @JoinColumn({ name: 'trip_id' })
  trip: Trip;

  @Column({ name: 'passenger_id' })
  passenger_id: string;

  @ManyToOne(() => User, (user) => user.bookings_as_passenger)
  @JoinColumn({ name: 'passenger_id' })
  passenger: User;

  @Column({
    type: 'enum',
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending',
  })
  status: BookingStatus;

  @Column({ name: 'meeting_point_name', length: 255, nullable: true })
  meeting_point_name: string | null;

  @Column({ name: 'meeting_point_lat', type: 'decimal', precision: 9, scale: 6, nullable: true })
  meeting_point_lat: number | null;

  @Column({ name: 'meeting_point_lng', type: 'decimal', precision: 9, scale: 6, nullable: true })
  meeting_point_lng: number | null;

  @CreateDateColumn({ name: 'booked_at' })
  booked_at: Date;

  @OneToOne(() => Payment, (payment) => payment.booking)
  payment: Payment;
}
