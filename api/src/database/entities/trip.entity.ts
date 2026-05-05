import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Booking } from './booking.entity';

export type TripStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

@Entity('trips')
export class Trip {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'driver_id' })
  driver_id: string;

  @ManyToOne(() => User, (user) => user.trips_as_driver)
  @JoinColumn({ name: 'driver_id' })
  driver: User;

  @Column({ name: 'origin_name', length: 255 })
  origin_name: string;

  @Column({ name: 'origin_lat', type: 'decimal', precision: 9, scale: 6 })
  origin_lat: number;

  @Column({ name: 'origin_lng', type: 'decimal', precision: 9, scale: 6 })
  origin_lng: number;

  @Column({ name: 'destination_name', length: 255 })
  destination_name: string;

  @Column({ name: 'destination_lat', type: 'decimal', precision: 9, scale: 6 })
  destination_lat: number;

  @Column({ name: 'destination_lng', type: 'decimal', precision: 9, scale: 6 })
  destination_lng: number;

  @Column({ name: 'departure_time', type: 'timestamptz' })
  departure_time: Date;

  @Column({ name: 'total_seats', type: 'int' })
  total_seats: number;

  @Column({ name: 'available_seats', type: 'int' })
  available_seats: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({
    type: 'enum',
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled',
  })
  status: TripStatus;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @OneToMany(() => Booking, (booking) => booking.trip)
  bookings: Booking[];
}
