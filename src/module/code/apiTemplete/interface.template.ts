import { Injectable } from '@nestjs/common'
import * as fs from 'fs'
import { SchemaDTO } from '../code.dto';
import { TemplateUtil } from 'src/utils/template.util';

@Injectable()
export class InterFaceTemplateService {
  constructor(
    private readonly templateUtil: TemplateUtil
  ) { }
  // 生成interface
  create(path: string, name: string, schemas: SchemaDTO[]) {
    const upCaseName = `${name[0].toUpperCase()}${name.slice(1)}`
    const schemaCodes: string[] = []
    schemas.map(schema => {
      schemaCodes.push(`  // ${schema.description}`)
      switch (schema.type) {
        case 'string':
        case 'ObjectId':
        case 'email':
        case 'phone':
          schemaCodes.push(`  readonly ${schema.key}: string;`)
          break;
        case 'number':
          schemaCodes.push(`  readonly ${schema.key}: number;`)
          break;
        case 'date':
          schemaCodes.push(`  readonly ${schema.key}: Date;`)
          break;
        case 'boolean':
          schemaCodes.push(`  readonly ${schema.key}: boolean;`)
          break;
        default:
          break;
      }
    })
    const codes: string[] = []
    codes.push(`import { Document } from 'mongoose';\n`)
    codes.push(`export interface I${upCaseName} extends Document {`)
    codes.push(`${this.templateUtil.toString(schemaCodes.filter(v => v), '\n')}`)
    codes.push('}')
    fs.writeFileSync(`${path}/${name}.interfaces.ts`, this.templateUtil.toString(codes, '\n'))
  }
}