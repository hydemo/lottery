import {
  UseGuards,
  Controller,
  Get,
  Post,
  Request,
  Put,
  Param,
} from '@nestjs/common';
import {
  ApiUseTags,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import * as moment from 'moment';
import { AuthGuard } from '@nestjs/passport';
import { LotteryService } from 'src/module/lottery/lottery.service';
import { MongodIdPipe } from 'src/common/pipe/mongodId.pipe';
@ApiUseTags('api/lottery')
@ApiBearerAuth()
@ApiForbiddenResponse({ description: 'Unauthorized' })
@UseGuards(AuthGuard())
@Controller('api/lotterys')
export class ApiLotteryController {
  constructor(private lotteryService: LotteryService) {}

  @Get('/')
  @ApiOkResponse({
    description: '获取奖池',
  })
  @ApiOperation({ title: '获取奖池', description: '获取奖池' })
  async list(): Promise<any> {
    return await this.lotteryService.listOfToday();
  }

  @Get('/check')
  @ApiOkResponse({
    description: '判断是否抽过奖',
  })
  @ApiOperation({ title: '判断是否抽过奖', description: '判断是否抽过奖' })
  async check(@Request() req: any): Promise<any> {
    if (!req.user.signTime) {
      return true;
    }
    const now = moment().format('YYYY-MM-DD');
    const lotteryTime = moment(req.user.signTime).format('YYYY-MM-DD');
    if (now === lotteryTime) {
      return false;
    }
    return true;
  }

  @Post('/')
  @ApiOkResponse({
    description: '抽奖',
  })
  @ApiOperation({ title: '抽奖', description: '抽奖' })
  async lottery(@Request() req: any): Promise<any> {
    // const now = moment().format('YYYY-MM-DD');
    // if (req.user.signTime) {
    //   const lotteryTime = moment(req.user.signTime).format('YYYY-MM-DD');
    //   if (now === lotteryTime) {
    //     return 'exist';
    //   }
    // }
    return await this.lotteryService.lottery(req.user._id);
  }

  @Get('/me')
  @ApiOkResponse({
    description: '我的奖品',
  })
  @ApiOperation({ title: '我的奖品', description: '我的奖品' })
  async me(@Request() req: any): Promise<any> {
    return await this.lotteryService.listByUser(req.user._id);
  }

  @Put('/:id')
  @ApiOkResponse({
    description: '兑换',
  })
  @ApiOperation({ title: '兑换', description: '兑换' })
  async exchange(
    @Request() req: any,
    @Param('id', new MongodIdPipe()) id: string,
  ): Promise<any> {
    return await this.lotteryService.exchange(req.user._id, id);
  }
}
