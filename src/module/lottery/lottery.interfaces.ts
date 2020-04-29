import { Document } from 'mongoose';

export interface ILottery extends Document {
  // 兑换码
  readonly code: string;
  // 用户
  readonly user: string;
  // 奖品
  readonly reward: number;
  // 是否兑换
  readonly exchange: boolean;
  // 兑换时间
  readonly exchangeTime: Date;
}
