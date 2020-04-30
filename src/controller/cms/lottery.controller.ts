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
  Response,
} from '@nestjs/common';
import {
  ApiUseTags,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import * as fs from 'fs';
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

  @Get('/download')
  @Roles(1)
  @ApiOkResponse({
    description: '订单列表',
  })
  @ApiOperation({ title: '订单列表', description: '订单列表, checkResult' })
  async download(@Request() req: any, @Response() res: any): Promise<any> {
    const userAgent = (req.headers['user-agent'] || '').toLowerCase();

    const filename = await this.lotteryService.download('temp');
    const path = `temp/${filename}`;

    let disposition;
    if (userAgent.indexOf('msie') >= 0 || userAgent.indexOf('chrome') >= 0) {
      disposition = `attachment; filename=${encodeURIComponent(filename)}`;
    } else if (userAgent.indexOf('firefox') >= 0) {
      disposition = `attachment; filename*="utf8''${encodeURIComponent(
        filename,
      )}"`;
    } else {
      /* safari等其他非主流浏览器只能自求多福了 */
      disposition = `attachment; filename=${new Buffer(filename).toString(
        'binary',
      )}`;
    }
    res.writeHead(200, {
      'Content-Type': 'application/octet-stream;charset=utf8',
      'Content-Disposition': disposition,
    });
    const stream = fs.createReadStream(path);
    stream.pipe(res);
    stream
      .on('end', () => {
        fs.exists(path, exists => {
          if (exists) fs.unlink(path, err => {});
        });
        return;
      })
      .on('error', err => {
        return;
      });
  }
}
