import { ApiModelProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsEnum, IsMongoId } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAdminDTO {
  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '昵称' })
  readonly username: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '昵称' })
  readonly nickname: string;

  @IsNumber()
  @IsEnum([1, 2])
  @Type(() => Number)
  @ApiModelProperty({ description: '权限' })
  readonly role: number;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '密码' })
  password: string;
}

export class UpdateAdminAvatarDTO {
  @IsString()
  @ApiModelProperty({ description: '头像' })
  readonly avatar: string;
}

export class UpdateAdminNickNameDTO {
  @IsString()
  @ApiModelProperty({ description: '昵称' })
  readonly nickname: string;
}

export class LoginDTO {
  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '用户名' })
  readonly username: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '密码' })
  readonly password: string;
}

export class updatePassDTO {
  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '密码' })
  readonly password: string;
}

export class ResetPassDTO {
  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '新密码' })
  readonly oldPassword: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '确认密码' })
  readonly newPassword: string;
}


