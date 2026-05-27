import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../database/entities/user.entity';

export type ReportType = 'bug' | 'suggestion' | 'other';
export type ReportStatus = 'open' | 'in_progress' | 'resolved';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  user_id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: ['bug', 'suggestion', 'other'],
    enumName: 'report_type_enum',
  })
  type: ReportType;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ length: 255, nullable: true })
  device_info: string | null;

  @Column({ length: 50, nullable: true })
  app_version: string | null;

  @Column({
    type: 'enum',
    enum: ['open', 'in_progress', 'resolved'],
    enumName: 'report_status_enum',
    default: 'open',
  })
  status: ReportStatus;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;
}
