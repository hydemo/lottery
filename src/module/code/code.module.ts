import { Module } from '@nestjs/common';
import { CodeService } from './code.service';
import { DtoTemplateService } from './apiTemplete/dto.template';
import { InterFaceTemplateService } from './apiTemplete/interface.template';
import { ModuleTemplateService } from './apiTemplete/module.templete';
import { ProviderTemplateService } from './apiTemplete/providers.template';
import { SchemaTemplateService } from './apiTemplete/schema.template';
import { ServiceTemplateService } from './apiTemplete/service.template';
import { CmsControllerTemplateService } from './apiTemplete/cmsController.template';
import { AppModuleTemplateService } from './apiTemplete/appModule.template';

@Module({
  providers: [
    CodeService,
    DtoTemplateService,
    InterFaceTemplateService,
    ModuleTemplateService,
    ProviderTemplateService,
    SchemaTemplateService,
    ServiceTemplateService,
    CmsControllerTemplateService,
    AppModuleTemplateService,
  ],
  exports: [CodeService],
  imports: [

  ],
})

export class CodeModule { }
