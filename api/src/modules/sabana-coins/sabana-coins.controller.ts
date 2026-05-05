import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { SabanaCoinsService } from './sabana-coins.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('sabana-coins')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sabana-coins')
export class SabanaCoinsController {
  constructor(private readonly sabanaCoinsService: SabanaCoinsService) {}

  @Get('balance')
  async getBalance(@Req() req: any) {
    return { balance: await this.sabanaCoinsService.getBalance(req.user.id) };
  }

  @Get('ledger')
  async getLedger(@Req() req: any) {
    return this.sabanaCoinsService.getLedger(req.user.id);
  }
}
