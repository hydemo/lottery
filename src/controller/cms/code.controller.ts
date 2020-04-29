import { Body, Controller, Post } from '@nestjs/common'
import {
  ApiUseTags,
  ApiForbiddenResponse,
  ApiOperation,
} from '@nestjs/swagger'
import { CreateCodeDTO } from 'src/module/code/code.dto'
import { CodeService } from 'src/module/code/code.service'


@ApiUseTags('cms/code')
@ApiForbiddenResponse({ description: 'Unauthorized' })
@Controller('/cms/codes')
export class CMSCodeController {
  constructor(
    private codeService: CodeService,
  ) { }

  @Post('')
  @ApiOperation({ title: '生成代码', description: '生成代码', })
  async create(
    @Body() codes: CreateCodeDTO

  ) {
    await this.codeService.create(codes)
    return 'success'
  }
}