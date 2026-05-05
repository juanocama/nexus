import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export type UserRoleType = 'driver' | 'passenger';

@Entity('user_roles')
export class UserRole {
  @PrimaryColumn({ name: 'user_id' })
  user_id: string;

  @PrimaryColumn({
    type: 'enum',
    enum: ['driver', 'passenger'],
  })
  role: UserRoleType;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => User, (user) => user.user_roles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
