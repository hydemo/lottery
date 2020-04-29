import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { InitModule } from './init/init.module';
import { AdminModule } from './module/admin/admin.module';
import { PassportModule } from '@nestjs/passport';
import { RedisModule } from 'nestjs-redis';
import { ConfigService } from './config/config.service';
import { CryptoUtil } from './utils/crypto.util';
import { CMSAdminController } from './controller/cms/admin.controller';
import { CMSLoginController } from './controller/cms/login.controller';
import { PaginationUtil } from './utils/pagination.util';
import { CMSUserController } from './controller/cms/user.controller';
import { UserModule } from './module/user/user.module';
import { CodeModule } from './module/code/code.module';
import { CMSCodeController } from './controller/cms/code.controller';
import { ConfigModule } from './config/config.module';
import { UtilModule } from './utils/util.module';
import { LotteryModule } from './module/lottery/lottery.module';
import { CMSLotteryController } from './controller/cms/lottery.controller';
import { ApiLoginController } from './controller/api/login.controller';
import { ApiLotteryController } from './controller/api/lottery.controller';
// import锚点

@Module({
  imports: [
    AuthModule,
    DatabaseModule,
    InitModule,
    AdminModule,
    CodeModule,
    UserModule,
    UtilModule,
    ConfigModule,
    LotteryModule,
    // module锚点
    PassportModule.register({ defaultStrategy: 'jwt' }),
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => configService.redis,
      inject: [ConfigService],
    }),
  ],
  exports: [PaginationUtil],
  providers: [CryptoUtil, PaginationUtil],
  controllers: [
    CMSLoginController,
    CMSAdminController,
    CMSUserController,
    CMSCodeController,
    CMSLotteryController,
    ApiLoginController,
    ApiLotteryController,
    // controller锚点
  ],
})
export class AppModule {}
