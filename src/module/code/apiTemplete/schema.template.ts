import { Injectable } from '@nestjs/common'
import * as fs from 'fs'
import { SchemaDTO } from '../code.dto';
import { TemplateUtil } from 'src/utils/template.util';

@Injectable()
export class SchemaTemplateService {
  constructor(
    private readonly templateUtil: TemplateUtil
  ) { }
  // 生成类型
  getType(type: string, schema: SchemaDTO) {
    let enumString: string = ''
    let defaultString: string = ''
    let requiredString: string = ''
    if (schema.enum && schema.enum.length) {
      enumString = `, enum: [${schema.enum.toString().replace(/,/g, `, `)}]`
    }
    if (schema.default !== undefined) {
      defaultString = `, default: ${schema.default}`
    }
    if (schema.required) {
      requiredString = `, required: true`
    }
    return `{ type: ${type}${
      enumString ? enumString : ''
      }${
      defaultString ? defaultString : ''
      }${
      requiredString ? requiredString : ''
      } }`
  }
  // 生成schema
  create(path: string, name: string, schemas: SchemaDTO[]) {
    const upCaseName = `${name[0].toUpperCase()}${name.slice(1)}`
    const schemaCodes: string[] = []
    schemas.map(schema => {
      schemaCodes.push(`    // ${schema.description}`)
      switch (schema.type) {
        case 'string':
        case 'email':
        case 'phone':
          schemaCodes.push(`    ${schema.key}: ${this.getType('String', schema)},`)
          break;
        case 'ObjectId':
          schemaCodes.push(`    ${schema.key}: ${this.getType('ObjectId', schema)},`)
          break;
        case 'number':
          schemaCodes.push(`    ${schema.key}: ${this.getType('Number', schema)},`)
          break;
        case 'date':
          schemaCodes.push(`    ${schema.key}: ${this.getType('Date', schema)},`)
          break;
        case 'boolean':
          schemaCodes.push(`    ${schema.key}: ${this.getType('Boolean', schema)},`)
          break;
        default:
          break;
      }
    })
    const codes: string[] = []
    const collectionString = `{ collection: '${name}', versionKey: false, timestamps: true },`
    codes.push(`import * as mongoose from 'mongoose';\n`)
    codes.push(`const ObjectId = mongoose.Types.ObjectId;\n`)
    codes.push(`export const ${upCaseName}Schema = new mongoose.Schema(`)
    codes.push(`  {`)
    codes.push(`${this.templateUtil.toString(schemaCodes.filter(v => v), '\n')}`)
    codes.push('    // 是否删除')
    codes.push('    isDelete: { type: Boolean, default: false },')
    codes.push('    // 删除时间')
    codes.push('    deleteTime: { type: Date },')
    codes.push('    // 删除人')
    codes.push('    deleteBy: { type: ObjectId },')
    codes.push('    // 创建人')
    codes.push('    createBy: { type: ObjectId },')
    codes.push('  },')
    codes.push(`  ${collectionString}`)
    codes.push(');')
    fs.writeFileSync(`${path}/${name}.schema.ts`, this.templateUtil.toString(codes, '\n'))
  }
}