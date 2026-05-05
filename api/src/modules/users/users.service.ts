import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
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
    };
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
