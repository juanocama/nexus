import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../../database/entities/review.entity';
import { User } from '../../database/entities/user.entity';
import { Trip } from '../../database/entities/trip.entity';
import { CreateReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Trip)
    private tripsRepository: Repository<Trip>,
  ) {}

  async create(createDto: CreateReviewDto, reviewerId: string): Promise<Review> {
    const reviewer = await this.usersRepository.findOne({ where: { id: reviewerId } });
    if (!reviewer) {
      throw new NotFoundException('Reviewer not found');
    }

    const reviewedUser = await this.usersRepository.findOne({
      where: { id: createDto.reviewed_user_id },
    });
    if (!reviewedUser) {
      throw new NotFoundException('User to review not found');
    }

    if (reviewerId === createDto.reviewed_user_id) {
      throw new BadRequestException('Cannot review yourself');
    }

    const trip = await this.tripsRepository.findOne({ where: { id: createDto.trip_id } });
    if (!trip) {
      throw new NotFoundException('Trip not found');
    }

    const existingReview = await this.reviewsRepository.findOne({
      where: {
        trip: { id: createDto.trip_id },
        reviewer: { id: reviewerId },
        reviewed_user: { id: createDto.reviewed_user_id },
      },
    });

    if (existingReview) {
      throw new BadRequestException('You already reviewed this user for this trip');
    }

    const review = this.reviewsRepository.create({
      trip: { id: createDto.trip_id },
      reviewer: { id: reviewerId },
      reviewed_user: { id: createDto.reviewed_user_id },
      rating: createDto.rating,
      comment: createDto.comment || null,
    });

    const savedReview = await this.reviewsRepository.save(review);

    const reviews = await this.reviewsRepository.find({
      where: { reviewed_user: { id: createDto.reviewed_user_id } },
    });

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await this.usersRepository.update(createDto.reviewed_user_id, {
      average_rating: avgRating,
      total_trips: reviewedUser.total_trips + 1,
    });

    return savedReview;
  }

  async findByUser(userId: string): Promise<Review[]> {
    return this.reviewsRepository.find({
      where: { reviewed_user: { id: userId } },
      relations: ['reviewer'],
      order: { created_at: 'DESC' },
    });
  }

  async findAll(): Promise<Review[]> {
    return this.reviewsRepository.find({
      relations: ['reviewer', 'reviewed_user'],
      order: { created_at: 'DESC' },
    });
  }
}
