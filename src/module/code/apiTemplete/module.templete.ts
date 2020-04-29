import { Injectable } from '@nestjs/common'
import * as fs from 'fs'
import { TemplateUtil } from 'src/utils/template.util';

@Injectable()
export class ModuleTemplateService {
  constructor(
    private readonly templateUtil: TemplateUtil
  ) { }
  // 生成module
  create(path: string, name: string) {
    const upCaseName = `${name[0].toUpperCase()}${name.slice(1)}`
    const codes: string[] = []
    codes.push(`import { Module } from '@nestjs/common';`)
    codes.push(`import { DatabaseModule } from '@database/database.module';`)
    codes.push(`import { ${name}Providers } from './${name}.providers';`)
    codes.push(`import { ${upCaseName}Service } from './${name}.service';\n`)
    codes.push(`@Module({`)
    codes.push(`  providers: [`)
    codes.push(`    ${upCaseName}Service,`)
    codes.push(`    ...${name}Providers,`)
    codes.push(`  ],`)
    codes.push(`  exports: [`)
    codes.push(`    ${upCaseName}Service,`)
    codes.push(`  ],`)
    codes.push(`  imports: [`)
    codes.push(`    DatabaseModule,`)
    codes.push(`  ],`)
    codes.push(`})`)
    codes.push(`export class ${upCaseName}Module { }`)
    fs.writeFileSync(`${path}/${name}.module.ts`, this.templateUtil.toString(codes, '\n'))
  }
}