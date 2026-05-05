import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Check,
} from 'typeorm';
import { Trip } from './trip.entity';
import { User } from './user.entity';

@Entity('reviews')
@Unique(['trip_id', 'reviewer_id', 'reviewed_user_id'])
@Check(`"reviewer_id" <> "reviewed_user_id"`)
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'trip_id' })
  trip_id: string;

  @ManyToOne(() => Trip)
  @JoinColumn({ name: 'trip_id' })
  trip: Trip;

  @Column({ name: 'reviewer_id' })
  reviewer_id: string;

  @ManyToOne(() => User, (user) => user.reviews_given)
  @JoinColumn({ name: 'reviewer_id' })
  reviewer: User;

  @Column({ name: 'reviewed_user_id' })
  reviewed_user_id: string;

  @ManyToOne(() => User, (user) => user.reviews_received)
  @JoinColumn({ name: 'reviewed_user_id' })
  reviewed_user: User;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
