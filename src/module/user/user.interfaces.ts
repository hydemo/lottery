import { Document } from 'mongoose';

export interface IUser extends Document {
  // 注册时间
  readonly registerTime: Date;
  // 注册ip
  readonly registerIp: string;
  // 微信id
  weixinOpenid: string;
  // 可用积分
  readonly integration: number;
  // 累积积分
  readonly integrationTotal: number;
  // 头像
  readonly avatar: string;
  // 性别
  readonly gender: number;
  // 昵称
  readonly nickname: string;
  // 最后登录时间
  readonly lastLoginTime: Date;
  // 最后登录ip
  readonly lastLoginIp: string;
  // 是否禁用
  readonly isBlock: boolean;
  // 是否禁用
  readonly blockTime: Date;
  // 禁用人
  readonly blockAdmin: string;
}