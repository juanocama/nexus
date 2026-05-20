import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('payment_cards')
export class PaymentCard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  user_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'mp_customer_id', length: 255 })
  mp_customer_id: string;

  @Column({ name: 'mp_card_id', length: 255 })
  mp_card_id: string;

  @Column({ length: 80 })
  brand: string;

  @Column({ name: 'payment_type', length: 40, nullable: true })
  payment_type: string | null;

  @Column({ name: 'last_four', length: 4 })
  last_four: string;

  @Column({ name: 'first_six', length: 6, nullable: true })
  first_six: string | null;

  @Column({ name: 'exp_month', type: 'int' })
  exp_month: number;

  @Column({ name: 'exp_year', type: 'int' })
  exp_year: number;

  @Column({ name: 'cardholder_name', length: 255, nullable: true })
  cardholder_name: string | null;

  @Column({ name: 'is_default', default: false })
  is_default: boolean;

  @Column({ name: 'provider_response', type: 'jsonb', nullable: true })
  provider_response: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
