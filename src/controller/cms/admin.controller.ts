import { Body, Controller, Get, Param, Post, Query, UseGuards, Inject, Request, Put, Response, Delete } from '@nestjs/common';
import {
  ApiUseTags,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { ResetPassDTO, updatePassDTO, CreateAdminDTO } from 'src/module/admin/admin.dto';
import { AdminService } from 'src/module/admin/admin.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/common/guard/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';
import { Pagination } from 'src/common/dto/pagination.dto';
import { MongodIdPipe } from 'src/common/pipe/mongodId.pipe';


@ApiUseTags('cms/admin')
@ApiForbiddenResponse({ description: 'Unauthorized' })
@UseGuards(AuthGuard(), RolesGuard)
@Controller('cms')
export class CMSAdminController {
  constructor(
    @Inject(AdminService) private adminService: AdminService,
  ) { }


  @Get('/admins')
  @Roles(0)
  @ApiOkResponse({
    description: '账号列表',
  })
  @ApiOperation({ title: '账号列表', description: '账号列表' })
  async list(
    @Query() pagination: Pagination,
  ): Promise<any> {
    return await this.adminService.list(pagination)

  }

  @Post('/admins')
  @Roles(0)
  @ApiOkResponse({
    description: '新增后台账号',
  })
  @ApiOperation({ title: '新增后台账号', description: '新增后台账号' })
  async add(
    @Body() account: CreateAdminDTO,
  ): Promise<any> {
    return await this.adminService.create(account)
  }

  @Put('/me/password')
  @ApiOkResponse({
    description: '重置密码',
  })
  @ApiOperation({ title: '重置密码', description: '重置密码' })
  async resetPassword(
    @Body() reset: ResetPassDTO,
    @Request() req,
  ): Promise<any> {
    return await this.adminService.resetPassword(req.user, reset)
  }

  @Put('/admins/:id')
  @Roles(0)
  @ApiOkResponse({
    description: '修改后台账号',
  })
  @ApiOperation({ title: '修改后台账号', description: '修改后台账号' })
  async update(
    @Param('id', new MongodIdPipe()) id: string,
    @Body() account: CreateAdminDTO,
  ): Promise<any> {
    return await this.adminService.update(id, account)
  }

  @Delete('/admins/:id')
  @ApiOkResponse({
    description: '删除',
  })
  @Roles(0)
  @ApiOperation({ title: '删除', description: '删除' })
  async removeByAdmin(
    @Param('id', new MongodIdPipe()) id: string,
  ): Promise<any> {
    return await this.adminService.removeByAdmin(id)
  }

  @Put('/admins/:id/recover')
  @ApiOkResponse({
    description: '恢复',
  })
  @Roles(0)
  @ApiOperation({ title: '恢复', description: '恢复' })
  async recoverByAdmin(
    @Param('id', new MongodIdPipe()) id: string,
  ): Promise<any> {
    return await this.adminService.recoverByAdmin(id)
  }

  @Put('/admins/:id/password')
  @ApiOkResponse({
    description: '重置密码',
  })
  @Roles(0)
  @ApiOperation({ title: '重置密码', description: '重置密码' })
  async resetPasswordByAdmin(
    @Body() newPass: updatePassDTO,
    @Param('id', new MongodIdPipe()) id: string,
    @Request() req,
  ): Promise<any> {
    return await this.adminService.resetPasswordByAdmin(id, newPass.password)
  }
}