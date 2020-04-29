import { Model } from 'mongoose';
import { Inject, Injectable } from '@nestjs/common';
import { IUser } from './user.interfaces';
import { Pagination } from '@common/dto/pagination.dto';
import { IList } from '@common/interface/list.interface';
import { JwtService } from '@nestjs/jwt';
import { ApiErrorCode } from '@common/enum/api-error-code.enum';
import { ApiException } from '@common/expection/api.exception';
import { WeixinUtil } from '@utils/weixin.util';
import { LoginDTO } from './login.dto';
import { PaginationUtil } from 'src/utils/pagination.util';

@Injectable()
export class UserService {
  // 注入的UserModelToken要与users.providers.ts里面的key一致就可以
  constructor(
    @Inject('UserModelToken') private readonly userModel: Model<IUser>,
    @Inject(WeixinUtil) private readonly weixinUtil: WeixinUtil,
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(PaginationUtil) private readonly paginationUtil: PaginationUtil,
  ) {}

  // 根据id查询
  async findById(_id: string): Promise<IUser | null> {
    return await this.userModel
      .findById(_id)
      .lean()
      .exec();
  }

  // 用户列表
  async list(pagination: Pagination): Promise<IList<IUser>> {
    const condition = this.paginationUtil.genCondition(pagination, [
      'nickname',
    ]);
    const list = await this.userModel
      .find(condition)
      .limit(pagination.pageSize)
      .skip((pagination.current - 1) * pagination.pageSize)
      .sort({ createdAt: -1 })
      .lean()
      .exec();
    const total = await this.userModel.countDocuments(condition);
    return { list, total };
  }

  // 根据id修改
  async updateById(_id: any, user: any) {
    return await this.userModel.findByIdAndUpdate(_id, user).exec();
  }

  async loginByWeixin(login: LoginDTO, ip: string): Promise<any> {
    // 解释用户数据
    const userinfo = await this.weixinUtil.oauth(login.code);
    if (!userinfo) {
      throw new ApiException('登录失败', ApiErrorCode.LOGIN_ERROR, 406);
    }
    // 根据openid查找用户是否已经注册
    let user: IUser = await this.userModel
      .findOne({ weixinOpenid: userinfo.openid })
      .lean()
      .exec();
    if (!user) {
      // 注册
      user = await this.userModel.create({
        registerTime: Date.now(),
        registerIp: ip,
        nickname: userinfo.nickname,
        avatar: userinfo.headimgurl,
        weixinOpenid: userinfo.openid,
      });
    }
    // 更新登录信息
    await this.userModel.findByIdAndUpdate(user._id, {
      lastLoginTime: Date.now(),
      lastLoginIp: ip,
    });

    const accessToken = await this.jwtService.sign({
      id: user._id,
      type: 'user',
    });

    if (!user || !accessToken) {
      throw new ApiException('登录失败', ApiErrorCode.LOGIN_ERROR, 406);
    }
    delete user.weixinOpenid;

    return { userinfo: user, accessToken };
  }

  async block(id: string, admin: string) {
    return await this.userModel.findByIdAndUpdate(id, {
      isBlock: true,
      blockTime: new Date(),
      blockBy: admin,
    });
  }

  async unblock(id: string, admin: string) {
    return await this.userModel.findByIdAndUpdate(id, {
      unBlockBy: admin,
      isBlock: false,
      $unset: { blockTime: 1 },
    });
  }
}
