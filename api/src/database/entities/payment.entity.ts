import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Booking } from './booking.entity';

export type PaymentMethod = 'pse' | 'card' | 'sabana_points';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'booking_id', unique: true })
  booking_id: string;

  @ManyToOne(() => Booking, (booking) => booking.payment)
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: ['pse', 'card', 'sabana_points'],
  })
  method: PaymentMethod;

  @Column({
    type: 'enum',
    enum: ['pending', 'success', 'failed', 'refunded'],
    default: 'pending',
  })
  status: PaymentStatus;

  @Column({ name: 'provider_reference', type: 'varchar', length: 255, nullable: true })
  provider_reference: string | null;

  @Column({ name: 'provider_response', type: 'jsonb', nullable: true })
  provider_response: Record<string, any> | null;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paid_at: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
