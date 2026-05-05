import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export type CoinType = 'earned' | 'spent' | 'redeemed' | 'bonus';

@Entity('sabana_coins_ledger')
export class SabanaCoinsLedger {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  user_id: string;

  @ManyToOne(() => User, (user) => user.sabana_coins_ledger)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'int' })
  amount: number;

  @Column({
    type: 'enum',
    enum: ['earned', 'spent', 'redeemed', 'bonus'],
  })
  type: CoinType;

  @Column({ length: 255, nullable: true })
  description: string | null;

  @Column({ name: 'reference_id', nullable: true })
  reference_id: string | null;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
