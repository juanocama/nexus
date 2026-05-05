import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SabanaCoinsService } from './sabana-coins.service';
import { SabanaCoinsController } from './sabana-coins.controller';
import { SabanaCoinsLedger } from '../../database/entities/sabana-coins-ledger.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SabanaCoinsLedger])],
  controllers: [SabanaCoinsController],
  providers: [SabanaCoinsService],
  exports: [SabanaCoinsService],
})
export class SabanaCoinsModule {}
