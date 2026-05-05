import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../database/entities/notification.entity';

export type NotificationType =
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'trip_cancelled'
  | 'trip_modified'
  | 'payment_received'
  | 'rating_received'
  | 'sabana_coins_earned';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
  ) {}

  async findByUser(userId: string): Promise<Notification[]> {
    return this.notificationsRepository.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
    });
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationsRepository.count({
      where: { user: { id: userId }, is_read: false },
    });
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    await this.notificationsRepository.update(
      { id, user: { id: userId } },
      { is_read: true },
    );
    return this.notificationsRepository.findOne({ where: { id } });
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationsRepository.update(
      { user: { id: userId }, is_read: false },
      { is_read: true },
    );
  }

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
  ): Promise<Notification> {
    const notification = this.notificationsRepository.create({
      user: { id: userId },
      type,
      title,
      message,
      is_read: false,
    });
    return this.notificationsRepository.save(notification);
  }
}
