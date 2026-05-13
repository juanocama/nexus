import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { UserRole } from '../../database/entities/user-role.entity';
import { Trip } from '../../database/entities/trip.entity';
import { Booking } from '../../database/entities/booking.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(Trip)
    private tripsRepository: Repository<Trip>,
  @InjectRepository(Booking)
  private bookingsRepository: Repository<Booking>,
) {}

  async getFrequentRoutes(userId: string): Promise<any[]> {
    const user = await this.findById(userId);
    const roles = user.user_roles?.map((r) => r.role) || [];
    const isDriver = roles.includes('driver');
    const isPassenger = roles.includes('passenger');

    const combined: Record<string, { origin_name: string; origin_lat: number; origin_lng: number; destination_name: string; destination_lat: number; destination_lng: number; count: number; type: 'publication' | 'booking' }> = {};

    if (isDriver) {
      const driverRoutes = await this.tripsRepository
        .createQueryBuilder('trip')
        .select([
          'trip.origin_name AS origin_name',
          'trip.origin_lat AS origin_lat',
          'trip.origin_lng AS origin_lng',
          'trip.destination_name AS destination_name',
          'trip.destination_lat AS destination_lat',
          'trip.destination_lng AS destination_lng',
          'COUNT(*) AS count',
        ])
        .where('trip.driver_id = :userId', { userId })
        .groupBy('trip.origin_name')
        .addGroupBy('trip.origin_lat')
        .addGroupBy('trip.origin_lng')
        .addGroupBy('trip.destination_name')
        .addGroupBy('trip.destination_lat')
        .addGroupBy('trip.destination_lng')
        .orderBy('COUNT(*)', 'DESC')
        .getRawMany();

      for (const r of driverRoutes) {
        const key = `${r.origin_name}|${r.destination_name}`;
        combined[key] = { ...r, count: Number(r.count), type: 'publication' };
      }
    }

    if (isPassenger) {
      const passengerRoutes = await this.bookingsRepository
        .createQueryBuilder('booking')
        .innerJoin('booking.trip', 'trip')
        .select([
          'trip.origin_name AS origin_name',
          'trip.origin_lat AS origin_lat',
          'trip.origin_lng AS origin_lng',
          'trip.destination_name AS destination_name',
          'trip.destination_lat AS destination_lat',
          'trip.destination_lng AS destination_lng',
          'COUNT(*) AS count',
        ])
        .where('booking.passenger_id = :userId', { userId })
        .groupBy('trip.origin_name')
        .addGroupBy('trip.origin_lat')
        .addGroupBy('trip.origin_lng')
        .addGroupBy('trip.destination_name')
        .addGroupBy('trip.destination_lat')
        .addGroupBy('trip.destination_lng')
        .orderBy('COUNT(*)', 'DESC')
        .getRawMany();

      for (const r of passengerRoutes) {
        const key = `${r.origin_name}|${r.destination_name}`;
        if (combined[key]) {
          combined[key].count += Number(r.count);
        } else {
          combined[key] = { ...r, count: Number(r.count), type: 'booking' };
        }
      }
    }

    return Object.values(combined)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map((r) => ({
        origin_name: r.origin_name,
        destination_name: r.destination_name,
        type: r.type,
        count: r.count,
      }));
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id }, relations: ['user_roles'] });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async getProfile(id: string) {
    const user = await this.findById(id);
    const { password_hash, ms_graph_token, refresh_token, ...profile } = user;
    return {
      ...profile,
      average_rating: Number(user.average_rating),
      roles: user.user_roles?.map((r) => r.role) || [],
    };
  }

  async updateRoles(id: string, roles: string[]) {
    const user = await this.findById(id);
    await this.userRoleRepository.delete({ user_id: id });
    const roleEntities = roles.map((role) =>
      this.userRoleRepository.create({ user_id: user.id, role: role as any }),
    );
    await this.userRoleRepository.save(roleEntities);
    return this.getProfile(id);
  }

  async updateProfile(id: string, updateData: Partial<User>) {
    const user = await this.findById(id);
    Object.assign(user, updateData);
    const updated = await this.usersRepository.save(user);
    const { password_hash, ms_graph_token, refresh_token, ...profile } = updated;
    return profile;
  }

  async getAll() {
    const users = await this.usersRepository.find();
    return users.map(u => {
      const { password_hash, ms_graph_token, refresh_token, ...safe } = u;
      return { ...safe, average_rating: Number(u.average_rating) };
    });
  }
}
