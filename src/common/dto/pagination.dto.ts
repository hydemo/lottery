import { ApiModelPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class Pagination {
  @IsNumber()
  @IsPositive()
  @IsOptional()
  @ApiModelPropertyOptional({ type: Number, example: 1, description: '页码' })
  @Type(() => Number)
  readonly current: number = 1;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @ApiModelPropertyOptional({ type: Number, example: 10, description: '每页条数' })
  @Type(() => Number)
  readonly pageSize: number = 10;

  @IsString()
  @Type(() => String)
  @ApiModelPropertyOptional({ type: String, description: '搜索参数' })
  readonly value?: string;

  // @I
  @IsOptional()
  @ApiModelPropertyOptional({ description: '过滤参数' })
  readonly filter?: any;
}
