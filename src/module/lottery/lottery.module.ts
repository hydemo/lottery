import { Module } from '@nestjs/common';
import { DatabaseModule } from '@database/database.module';
import { lotteryProviders } from './lottery.providers';
import { LotteryService } from './lottery.service';
import { UserModule } from '../user/user.module';

@Module({
  providers: [LotteryService, ...lotteryProviders],
  exports: [LotteryService],
  imports: [DatabaseModule, UserModule],
})
export class LotteryModule {}
