import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as md5 from 'md5';
import * as fs from 'fs';
import axios from 'axios';
import * as rp from 'request-promise';
import { ConfigService } from '@config/config.service';
import { LoginDTO } from 'src/module/user/login.dto';
import { IPayInfo } from 'src/common/interface/payInfo.interface';
import { RedisService } from 'nestjs-redis';
import { ApplicationDTO } from 'src/common/dto/Message.dto';

@Injectable()
export class WeixinUtil {
  constructor(
    private readonly config: ConfigService,
    private readonly redis: RedisService,
  ) {}

  // 授权登录
  async oauth(code: string): Promise<any | null> {
    const result = await axios({
      method: 'get',
      url: 'https://api.weixin.qq.com/sns/oauth2/access_token',
      params: {
        appid: this.config.gzhAppid,
        secret: this.config.gzhAppSecret,
        code,
        grant_type: 'authorization_code',
      },
    });
    if (result && result.data && result.data.access_token) {
      // return await this.userinfo(result.data);
      return result.data.openid;
    }
    return null;
  }

  async userinfo(data: any): Promise<any> {
    const result = await axios({
      method: 'get',
      url: 'https://api.weixin.qq.com/sns/userinfo',
      params: {
        access_token: data.access_token,
        openid: data.openid,
        lang: 'zh-CN',
      },
    });
    if (result && result.data) {
      return result.data;
    }
  }
}
