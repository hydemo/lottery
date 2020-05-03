import { ApiModelProperty } from '@nestjs/swagger';
import {
  IsString,
  IsMongoId,
  IsNumber,
  IsBoolean,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLotteryDTO {
  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '兑换码' })
  readonly code: string;

  @IsMongoId()
  @Type(() => String)
  @ApiModelProperty({ description: '用户' })
  readonly user: string;

  @IsNumber()
  @Type(() => Number)
  @ApiModelProperty({ description: '奖品' })
  readonly reward: number;

  readonly cache?: boolean;
  readonly createdAt?: any;
}
