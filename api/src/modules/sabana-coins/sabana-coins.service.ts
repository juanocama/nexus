import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SabanaCoinsLedger } from '../../database/entities/sabana-coins-ledger.entity';

export type CoinType = 'earned' | 'spent' | 'redeemed' | 'bonus';

@Injectable()
export class SabanaCoinsService {
  constructor(
    @InjectRepository(SabanaCoinsLedger)
    private ledgerRepository: Repository<SabanaCoinsLedger>,
  ) {}

  async getBalance(userId: string): Promise<number> {
    const entries = await this.ledgerRepository.find({
      where: { user: { id: userId } },
    });

    return entries.reduce((sum, entry) => sum + entry.amount, 0);
  }

  async getLedger(userId: string): Promise<SabanaCoinsLedger[]> {
    return this.ledgerRepository.find({
      where: { user: { id: userId } },
      order: { created_at: 'DESC' },
    });
  }

  async addCoins(
    userId: string,
    amount: number,
    type: CoinType,
    description?: string,
    referenceId?: string,
  ): Promise<SabanaCoinsLedger> {
    const entry = this.ledgerRepository.create({
      user: { id: userId },
      amount,
      type,
      description: description || null,
      reference_id: referenceId || null,
    });
    return this.ledgerRepository.save(entry);
  }

  async spendCoins(
    userId: string,
    amount: number,
    description?: string,
    referenceId?: string,
  ): Promise<SabanaCoinsLedger> {
    const balance = await this.getBalance(userId);
    if (balance < amount) {
      throw new Error('Insufficient Sabana Coins balance');
    }

    return this.addCoins(userId, -Math.abs(amount), 'spent', description, referenceId);
  }
}
