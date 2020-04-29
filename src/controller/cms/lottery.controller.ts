import {
  UseGuards,
  Controller,
  Request,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import {
  ApiUseTags,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Pagination } from 'src/common/dto/pagination.dto';
import { LotteryService } from 'src/module/lottery/lottery.service';
@ApiUseTags('cms/lottery')
@ApiBearerAuth()
@ApiForbiddenResponse({ description: 'Unauthorized' })
@UseGuards(AuthGuard(), RolesGuard)
@Controller('cms/lotterys')
export class CMSLotteryController {
  constructor(private lotteryService: LotteryService) {}

  @Get('/')
  @Roles(1)
  @ApiOkResponse({
    description: '抽奖结果列表',
  })
  @ApiOperation({ title: '抽奖结果列表', description: '抽奖结果列表' })
  async list(@Query() pagination: Pagination): Promise<any> {
    return await this.lotteryService.list(pagination);
  }
}
