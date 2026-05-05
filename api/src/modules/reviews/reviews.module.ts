import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { Review } from '../../database/entities/review.entity';
import { User } from '../../database/entities/user.entity';
import { Trip } from '../../database/entities/trip.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, User, Trip])],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
