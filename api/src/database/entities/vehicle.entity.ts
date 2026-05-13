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
import { Trip } from './trip.entity';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'driver_id' })
  driver_id: string;

  @ManyToOne(() => User, (user) => user.vehicles)
  @JoinColumn({ name: 'driver_id' })
  driver: User;

  @Column({ length: 100 })
  brand: string;

  @Column({ length: 100 })
  model: string;

  @Column({ length: 50 })
  color: string;

  @Column({ length: 20 })
  plate: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  @Column({ name: 'deleted_at', nullable: true })
  deleted_at: Date | null;

  @OneToMany(() => Trip, (trip) => trip.vehicle)
  trips: Trip[];
}
