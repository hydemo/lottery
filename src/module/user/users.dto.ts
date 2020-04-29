import { ApiModelProperty, ApiModelPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class UserDTO {
  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '用户名' })
  readonly username?: string;

  @IsEmail({}, { message: '邮箱格式不正确' })
  @Type(() => String)
  @ApiModelProperty({ description: '邮箱' })
  readonly email?: string;

  @IsString()
  @Type(() => String)
  @ApiModelPropertyOptional({ description: '密码' })
  password?: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '注册时间' })
  readonly registerTime?: Date;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '注册ip' })
  readonly registerIp?: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '手机号' })
  readonly phone?: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '微信id' })
  readonly weixinOpenid?: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '头像' })
  readonly avatar: string;

  @IsNumber()
  @Type(() => Number)
  @ApiModelProperty({ description: '性别' })
  readonly gender: number;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '昵称' })
  readonly nickname: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '最后登录时间' })
  readonly lastLoginTime?: Date;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '最后登录ip' })
  readonly lastLoginIp?: string;

  accessToken?: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '是否禁用' })
  readonly isBlock?: boolean;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '禁用时间' })
  readonly blockTime?: Date;

  isFollowing?: boolean;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '单位' })
  readonly company?: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '职业' })
  readonly occupation?: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '个性签名' })
  readonly signature?: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  @ApiModelProperty({ description: '用户余额' })
  readonly balance?: number;
}

export class CreatUserDTO {
  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '用户名' })
  readonly username?: string;

  @IsEmail({}, { message: '邮箱格式不正确' })
  @Type(() => String)
  @ApiModelProperty({ description: '邮箱' })
  readonly email?: string;

  @IsString()
  @Type(() => String)
  @ApiModelPropertyOptional({ description: '密码' })
  password?: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '手机号' })
  readonly phone?: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '头像' })
  readonly avatar: string;

  @IsNumber()
  @Type(() => Number)
  @ApiModelProperty({ description: '性别' })
  readonly gender: number;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '昵称' })
  readonly nickname: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '单位' })
  readonly company?: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '职业' })
  readonly occupation?: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '个性签名' })
  readonly signature?: string;
}

export class RechargeDTO {
  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '充值卡号' })
  readonly key: string;
}