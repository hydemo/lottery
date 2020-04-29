import * as mongoose from 'mongoose';

const ObjectId = mongoose.Types.ObjectId;

export const LotterySchema = new mongoose.Schema(
  {
    // 兑换码
    code: { type: String },
    // 用户
    user: { type: ObjectId },
    // 奖品
    reward: { type: Number },
    // 是否兑换
    exchange: { type: Boolean, default: false },
    // 是否兑换
    exchangeBy: { type: ObjectId },
    // 兑换时间
    exchangeTime: { type: Date },
    // 是否删除
    isDelete: { type: Boolean, default: false },
    // 删除时间
    deleteTime: { type: Date },
    // 删除人
    deleteBy: { type: ObjectId },
    // 创建人
    createBy: { type: ObjectId },
    // 日期
    date: { type: String },
  },
  { collection: 'lottery', versionKey: false, timestamps: true },
);
