import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  Inject,
  Request,
  Put,
  Response,
  Delete,
} from '@nestjs/common';
import {
  ApiUseTags,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UserService } from 'src/module/user/user.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Pagination } from 'src/common/dto/pagination.dto';
import { MongodIdPipe } from 'src/common/pipe/mongodId.pipe';

@ApiUseTags('cms/user')
@ApiForbiddenResponse({ description: 'Unauthorized' })
@UseGuards(AuthGuard(), RolesGuard)
@Controller('cms/users')
export class CMSUserController {
  constructor(@Inject(UserService) private userService: UserService) {}

  @Get('/')
  @Roles(0)
  @ApiOkResponse({
    description: '账号列表',
  })
  @ApiOperation({ title: '账号列表', description: '账号列表' })
  async list(@Query() pagination: Pagination): Promise<any> {
    return await this.userService.list(pagination);
  }

  @Put('/:id/block')
  @ApiOkResponse({
    description: '禁用',
  })
  @Roles(0)
  @ApiOperation({ title: '禁用', description: '禁用' })
  async block(
    @Param('id', new MongodIdPipe()) id: string,
    @Request() req: any,
  ): Promise<any> {
    return await this.userService.block(id, req.user._id);
  }

  @Put('/:id/unblock')
  @ApiOkResponse({
    description: '启用',
  })
  @Roles(0)
  @ApiOperation({ title: '启用', description: '启用' })
  async unblock(
    @Param('id', new MongodIdPipe()) id: string,
    @Request() req: any,
  ): Promise<any> {
    return await this.userService.unblock(id, req.user._id);
  }
}
