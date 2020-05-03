import * as md5 from 'md5';
import { Injectable } from '@nestjs/common';
import { CreateAdminDTO } from 'src/module/admin/admin.dto';
import { AdminService } from 'src/module/admin/admin.service';
import { RedisService } from 'nestjs-redis';
import { LotteryService } from 'src/module/lottery/lottery.service';

@Injectable()
export class InitService {
  constructor(
    private readonly adminService: AdminService,
    private readonly loteryService: LotteryService,
  ) {}

  async init() {
    await this.loteryService.reset();
    const adminExist = await this.adminService.findOne({ role: 0 });
    if (!adminExist) {
      const admin: CreateAdminDTO = {
        nickname: '超级管理员',
        password: md5('111111'),
        username: 'admin',
        role: 0,
      };
      await this.adminService.create(admin);
    }
  }
}
