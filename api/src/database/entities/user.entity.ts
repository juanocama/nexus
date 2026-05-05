import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Trip } from './trip.entity';
import { Booking } from './booking.entity';
import { Review } from './review.entity';
import { Notification } from './notification.entity';
import { SabanaCoinsLedger } from './sabana-coins-ledger.entity';

export type UserStatus = 'active' | 'suspended' | 'deactivated';
export type UserRole = 'driver' | 'passenger';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ length: 255 })
  full_name: string;

  @Column({ name: 'password_hash', nullable: true })
  @Exclude()
  password_hash: string | null;

  @Column({ name: 'profile_photo_url', length: 500, nullable: true })
  profile_photo_url: string | null;

  @Column({ length: 150, nullable: true })
  faculty: string | null;

  @Column({ length: 20, nullable: true })
  phone: string | null;

  @Column({
    type: 'enum',
    enum: ['active', 'suspended', 'deactivated'],
    default: 'active',
  })
  status: UserStatus;

  @Column({ name: 'ms_graph_token', type: 'text', nullable: true })
  @Exclude()
  ms_graph_token: string | null;

  @Column({ name: 'refresh_token', type: 'text', nullable: true })
  @Exclude()
  refresh_token: string | null;

  @Column({ name: 'average_rating', type: 'decimal', precision: 3, scale: 2, default: 0 })
  average_rating: number;

  @Column({ name: 'total_trips', type: 'int', default: 0 })
  total_trips: number;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @OneToMany(() => Trip, (trip) => trip.driver)
  trips_as_driver: Trip[];

  @OneToMany(() => Booking, (booking) => booking.passenger)
  bookings_as_passenger: Booking[];

  @OneToMany(() => Review, (review) => review.reviewer)
  reviews_given: Review[];

  @OneToMany(() => Review, (review) => review.reviewed_user)
  reviews_received: Review[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  @OneToMany(() => SabanaCoinsLedger, (ledger) => ledger.user)
  sabana_coins_ledger: SabanaCoinsLedger[];
}
