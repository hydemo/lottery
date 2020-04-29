import { Injectable } from '@nestjs/common'
import * as fs from 'fs'
import { TemplateUtil } from 'src/utils/template.util';

@Injectable()
export class ProviderTemplateService {
  constructor(
    private readonly templateUtil: TemplateUtil
  ) { }
  // 生成providers
  create(path: string, name: string) {
    const upCaseName = `${name[0].toUpperCase()}${name.slice(1)}`
    const codes: string[] = []
    codes.push(`import { Connection } from 'mongoose';`)
    codes.push(`import { ${upCaseName}Schema } from './${name}.schema';\n`)
    codes.push(`export const ${name}Providers = [`)
    codes.push(`  {`)
    codes.push(`    provide: '${upCaseName}ModelToken',`)
    codes.push(`    useFactory: (connection: Connection) => connection.model('${name}', ${upCaseName}Schema),`)
    codes.push(`    inject: ['MongoDBConnection'],`)
    codes.push(`  },`)
    codes.push(`]`)
    fs.writeFileSync(`${path}/${name}.providers.ts`, this.templateUtil.toString(codes, '\n'))
  }
}