import * as mongoose from 'mongoose';

const ObjectId = mongoose.Types.ObjectId;

export const AdminSchema = new mongoose.Schema(
  {
    // 用户名
    username: { type: String },
    // 昵称
    nickname: { type: String },
    // 昵称
    // 权限 1:超级管理员 2:运营 3:加盟商
    role: { type: Number, enum: [0, 1, 2], default: 1 },
    // 密码
    password: String,
    // 邮箱
    // email: { type: String, unique: true },
    // 注册时间
    registerTime: Date,
    // 手机
    // phone: { type: String, unique: true },
    // 头像
    avatar: { type: String },
    // 最后登录时间
    lastLoginTime: Date,
    // 最后登录ip
    lastLoginIp: String,
    // 是否删除
    isDelete: { type: Boolean, default: false },
    // 删除时间
    deleteTime: Date
  },
  { collection: 'admin', versionKey: false, timestamps: true },
);
