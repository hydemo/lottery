import { Module, Global } from '@nestjs/common';
import { InitService } from './init.service';
import { AdminModule } from 'src/module/admin/admin.module';
import { LotteryModule } from 'src/module/lottery/lottery.module';

@Global()
@Module({
  providers: [InitService],
  imports: [AdminModule, LotteryModule],
  exports: [InitService],
})
export class InitModule {}
