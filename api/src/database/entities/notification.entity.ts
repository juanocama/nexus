import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export type NotificationType =
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'trip_cancelled'
  | 'trip_modified'
  | 'payment_received'
  | 'rating_received'
  | 'sabana_coins_earned';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  user_id: string;

  @ManyToOne(() => User, (user) => user.notifications)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: [
      'booking_confirmed',
      'booking_cancelled',
      'trip_cancelled',
      'trip_modified',
      'payment_received',
      'rating_received',
      'sabana_coins_earned',
    ],
  })
  type: NotificationType;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: false })
  is_read: boolean;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
