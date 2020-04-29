import { Module, Global } from '@nestjs/common';
import { CryptoUtil } from './crypto.util';
import { PaginationUtil } from './pagination.util';
import { WeixinUtil } from './weixin.util';
import { RedisModule } from 'nestjs-redis';
import { ConfigService } from 'src/config/config.service';
import { TemplateUtil } from './template.util';
@Global()
@Module({
  providers: [
    CryptoUtil,
    PaginationUtil,
    WeixinUtil,
    TemplateUtil,
  ],
  exports: [
    CryptoUtil,
    PaginationUtil,
    WeixinUtil,
    TemplateUtil,
  ],
  imports: [
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) => configService.redis,
      inject: [ConfigService]
    }),
  ]
})
export class UtilModule { }