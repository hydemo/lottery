import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { SchemaDTO } from '../code.dto';
import { TemplateUtil } from 'src/utils/template.util';

@Injectable()
export class DtoTemplateService {
  constructor(private readonly templateUtil: TemplateUtil) {}
  // 生成验证字段
  getSchema(
    schemaCodes: string[],
    schemaTypes: string[],
    validator: string,
    type: string,
    schema: SchemaDTO,
  ) {
    let upCaseType = `${type[0].toUpperCase()}${type.slice(1)}`;
    if (type === 'Date') {
      upCaseType = type;
    }
    let enumString: string = '';
    if (schema.enum && schema.enum.length) {
      enumString = `  @IsEnum([${schema.enum.toString().replace(/,/g, `, `)}])`;
      schemaTypes.push('IsEnum');
    }
    let validatorType: string = `@${validator}()`;
    if (validator === 'IsMobilePhone') {
      validatorType = `@IsMobilePhone('zh-CN')`;
    }
    schemaCodes.push(`  ${validatorType}`);
    schemaCodes.push(`${schema.enum && schema.enum.length ? enumString : ''}`);
    schemaCodes.push(`  @Type(() => ${upCaseType})`);
    schemaCodes.push(
      `  @ApiModelProperty({ description: '${schema.description}' })`,
    );
    schemaCodes.push(`  readonly ${schema.key}: ${type};\n`);
    schemaTypes.push(`${validator}`);
  }

  // 生成dto
  create(path: string, name: string, schemas: SchemaDTO[]) {
    const upCaseName = `${name[0].toUpperCase()}${name.slice(1)}`;
    const schemaCodes: string[] = [];
    const schemaTypes: string[] = [];
    schemas.map(schema => {
      switch (schema.type) {
        case 'string':
          this.getSchema(
            schemaCodes,
            schemaTypes,
            'IsString',
            'string',
            schema,
          );
          break;
        case 'ObjectId':
          this.getSchema(
            schemaCodes,
            schemaTypes,
            'IsMongoId',
            'string',
            schema,
          );
          break;
        case 'number':
          this.getSchema(
            schemaCodes,
            schemaTypes,
            'IsNumber',
            'number',
            schema,
          );
          break;
        case 'phone':
          this.getSchema(
            schemaCodes,
            schemaTypes,
            `IsMobilePhone`,
            'string',
            schema,
          );
          break;
        case 'email':
          this.getSchema(schemaCodes, schemaTypes, 'IsEmail', 'string', schema);
          break;
        case 'date':
          this.getSchema(schemaCodes, schemaTypes, 'IsDate', 'Date', schema);
          break;
        case 'boolean':
          this.getSchema(
            schemaCodes,
            schemaTypes,
            'IsBoolean',
            'boolean',
            schema,
          );
          break;
        default:
          break;
      }
    });
    const uniqSchemaTypes = this.templateUtil.uniq(schemaTypes);
    const codes: string[] = [];
    codes.push(`import { ApiModelProperty } from '@nestjs/swagger';`);
    codes.push(
      `import { ${uniqSchemaTypes
        .toString()
        .replace(/,/g, `, `)} } from 'class-validator';`,
    );
    codes.push(`import { Type } from 'class-transformer';\n`);
    codes.push(`export class Create${upCaseName}DTO {`);
    codes.push(
      `${this.templateUtil.toString(schemaCodes.filter(v => v), '\n')}`,
    );
    codes.push('}');
    fs.writeFileSync(
      `${path}/${name}.dto.ts`,
      this.templateUtil.toString(codes, '\n'),
    );
  }
}
