import { Injectable } from '@nestjs/common'
import * as fs from 'fs'
import { TemplateUtil } from 'src/utils/template.util';

@Injectable()
export class AppModuleTemplateService {
  constructor(
    private readonly templateUtil: TemplateUtil
  ) { }
  // 生成service
  create(path: string, name: string) {
    const upCaseName = `${name[0].toUpperCase()}${name.slice(1)}`
    let appModule: string = fs.readFileSync(path, 'utf8').toString()
    const imports: string[] = []
    const modules: string[] = []
    const controllers: string[] = []
    imports.push(`import { ${upCaseName}Module } from './module/${name}/${name}.module';`)
    imports.push(`import { CMS${upCaseName}Controller } from './controller/cms/${name}.controller';`)
    imports.push(`// import锚点`)
    modules.push(`${upCaseName}Module,`)
    modules.push(`    // module锚点`)
    controllers.push(`CMS${upCaseName}Controller,`)
    controllers.push(`    // controller锚点`)
    appModule = appModule.replace('// import锚点', this.templateUtil.toString(imports, '\n'))
    appModule = appModule.replace('// module锚点', this.templateUtil.toString(modules, '\n'))
    appModule = appModule.replace('// controller锚点', this.templateUtil.toString(controllers, '\n'))
    fs.writeFileSync(path, appModule)
  }
}