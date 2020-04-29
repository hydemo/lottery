import { ApiModelProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Type } from 'class-transformer';
export class LoginDTO {
  @IsString()
  @Type(() => String)
  @ApiModelProperty({ description: '授权码' })
  readonly code: string;
}
