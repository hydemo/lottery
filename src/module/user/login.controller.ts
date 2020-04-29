import {
  Body,
  Controller,
  Post,
  Request,
} from '@nestjs/common';
import {
  ApiUseTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { LoginDTO } from './login.dto';
import { UserService } from './user.service';


// UseGuards()傳入@nest/passport下的AuthGuard
// strategy
@ApiUseTags('api/login')
@ApiBearerAuth()
@ApiForbiddenResponse({ description: 'Unauthorized' })
@Controller('api')
export class UserLoginController {
  constructor(
    private userService: UserService,
  ) { }

  @Post('/login/weixin')
  @ApiOkResponse({
    description: '微信登录',
  })
  @ApiOperation({ title: '微信登录', description: '微信登录' })
  async loginByWeixinAction(
    @Body() login: LoginDTO,
    @Request() req) {
    const clientIp = req.headers['x-real-ip'] ? req.headers['x-real-ip'] : req.ip.replace(/::ffff:/, '');
    return await this.userService.loginByWeixin(login, clientIp);
  }
}