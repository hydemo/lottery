import { Injectable } from '@nestjs/common'
import * as fs from 'fs'
import { CreateCodeDTO } from './code.dto'
import { DtoTemplateService } from './apiTemplete/dto.template'
import { InterFaceTemplateService } from './apiTemplete/interface.template'
import { ModuleTemplateService } from './apiTemplete/module.templete'
import { ProviderTemplateService } from './apiTemplete/providers.template'
import { SchemaTemplateService } from './apiTemplete/schema.template'
import { ServiceTemplateService } from './apiTemplete/service.template'
import { CmsControllerTemplateService } from './apiTemplete/cmsController.template'
import { AppModuleTemplateService } from './apiTemplete/appModule.template'
import { ApiException } from 'src/common/expection/api.exception'
import { ApiErrorCode } from 'src/common/enum/api-error-code.enum'

@Injectable()
export class CodeService {
  constructor(
    private readonly dtoTemplateService: DtoTemplateService,
    private readonly interFaceTemplateService: InterFaceTemplateService,
    private readonly moduleTemplateService: ModuleTemplateService,
    private readonly providerTemplateService: ProviderTemplateService,
    private readonly schemaTemplateService: SchemaTemplateService,
    private readonly serviceTemplateService: ServiceTemplateService,
    private readonly cmsControllerTemplateService: CmsControllerTemplateService,
    private readonly appModuleTemplateService: AppModuleTemplateService,
  ) { }

  // 创建数据
  create(schemas: CreateCodeDTO) {
    this.createApiCode(schemas)
    // this.createCmsCode(schemas)
  }

  // 生成后端代码
  createApiCode(schemas) {
    const modulePath = `src/module/${schemas.name}`
    const exist = fs.existsSync(modulePath)
    if (exist) {
      throw new ApiException('模块已存在', ApiErrorCode.EXIST, 403)
    }
    const controllerPath = `src/controller/cms`
    const appModulePath = 'src/app.module.ts'
    fs.mkdirSync(modulePath)
    this.dtoTemplateService.create(modulePath, schemas.name, schemas.schemas)
    this.interFaceTemplateService.create(modulePath, schemas.name, schemas.schemas)
    this.moduleTemplateService.create(modulePath, schemas.name)
    this.providerTemplateService.create(modulePath, schemas.name)
    this.schemaTemplateService.create(modulePath, schemas.name, schemas.schemas)
    this.serviceTemplateService.create(modulePath, schemas.name)
    this.cmsControllerTemplateService.create(controllerPath, schemas.name, schemas.description)
    this.appModuleTemplateService.create(appModulePath, schemas.name)
  }

  // 生成CMS代码
  createCmsCode(schemas) {
    const modulePath = `src/module/${schemas.name}`
    const exist = fs.existsSync(modulePath)
    if (exist) {
      throw new ApiException('模块已存在', ApiErrorCode.EXIST, 403)
    }
    const controllerPath = `src/controller/cms`
    const appModulePath = 'src/app.module.ts'
    fs.mkdirSync(modulePath)
    this.dtoTemplateService.create(modulePath, schemas.name, schemas.schemas)
    this.interFaceTemplateService.create(modulePath, schemas.name, schemas.schemas)
    this.moduleTemplateService.create(modulePath, schemas.name)
    this.providerTemplateService.create(modulePath, schemas.name)
    this.schemaTemplateService.create(modulePath, schemas.name, schemas.schemas)
    this.serviceTemplateService.create(modulePath, schemas.name)
    this.cmsControllerTemplateService.create(controllerPath, schemas.name, schemas.description)
    this.appModuleTemplateService.create(appModulePath, schemas.name)
  }
}