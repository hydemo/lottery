import { ApiModelProperty } from '@nestjs/swagger';
import { IsString, IsArray, ValidateNested, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class SchemaDTO {
  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '类型' })
  readonly type: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '描述' })
  readonly description: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '键值' })
  readonly key: string;

  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '默认值' })
  readonly default: string;

  @IsBoolean()
  @Type(() => Boolean)
  @ApiModelProperty({ description: '是否必填' })
  readonly required: boolean;

  @IsArray()
  @ApiModelProperty({ description: '枚举' })
  readonly enum: any[];

}

export class CreateCodeDTO {
  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '名称' })
  readonly name: string;


  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '描述' })
  readonly description: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SchemaDTO)
  @ApiModelProperty({ description: '属性', type: [SchemaDTO] })
  readonly schemas: SchemaDTO[]
}






