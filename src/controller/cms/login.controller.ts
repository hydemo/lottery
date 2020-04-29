import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Inject,
  Request,
} from '@nestjs/common';
import {
  ApiUseTags,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { LoginDTO } from 'src/module/admin/admin.dto';
import { AdminService } from 'src/module/admin/admin.service';
import { AuthGuard } from '@nestjs/passport';

@ApiUseTags('cms/login')
@ApiForbiddenResponse({ description: 'Unauthorized' })
@Controller('cms')
export class CMSLoginController {
  constructor(@Inject(AdminService) private adminService: AdminService) {}
  @Post('/login')
  @ApiOkResponse({
    description: '登录成功',
  })
  @ApiOperation({ title: '登录', description: '登录' })
  async login(@Body() login: LoginDTO, @Request() req): Promise<any> {
    const clientIp = req.headers['x-real-ip']
      ? req.headers['x-real-ip']
      : req.ip.replace(/::ffff:/, '');
    return await this.adminService.login(
      login.username,
      login.password,
      clientIp,
    );
  }

  @Get('/me')
  @UseGuards(AuthGuard())
  @ApiOkResponse({
    description: '我的信息',
  })
  @ApiOperation({ title: '我的信息', description: '我的信息' })
  async me(@Request() req): Promise<any> {
    const me = req.user;
    delete me.password;
    return me;
  }
}
