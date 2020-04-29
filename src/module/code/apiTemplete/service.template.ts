import { Injectable } from '@nestjs/common'
import * as fs from 'fs'
import { TemplateUtil } from 'src/utils/template.util';

@Injectable()
export class ServiceTemplateService {
  constructor(
    private readonly templateUtil: TemplateUtil
  ) { }
  // 生成service
  create(path: string, name: string) {
    const upCaseName = `${name[0].toUpperCase()}${name.slice(1)}`
    const codes: string[] = []
    codes.push(`import { Model } from 'mongoose';`)
    codes.push(`import { Inject, Injectable } from '@nestjs/common';`)
    codes.push(`import { ApiErrorCode } from '@common/enum/api-error-code.enum';`)
    codes.push(`import { ApiException } from '@common/expection/api.exception';`)
    codes.push(`import { Pagination } from 'src/common/dto/pagination.dto';`)
    codes.push(`import { PaginationUtil } from 'src/utils/pagination.util';`)
    codes.push(`import { IList } from 'src/common/interface/list.interface';`)
    codes.push(`import { Create${upCaseName}DTO } from './${name}.dto';`)
    codes.push(`import { I${upCaseName} } from './${name}.interfaces';\n`)
    codes.push(`@Injectable()`)
    codes.push(`export class ${upCaseName}Service {`)
    codes.push(`  constructor(`)
    codes.push(`    @Inject('${upCaseName}ModelToken') private readonly ${name}Model: Model<I${upCaseName}>,`)
    codes.push(`    @Inject(PaginationUtil) private readonly paginationUtil: PaginationUtil,`)
    codes.push(`  ) { }\n`)

    codes.push(`  // 创建数据`)
    codes.push(`  async create(create${upCaseName}DTO: Create${upCaseName}DTO, user: string): Promise<I${upCaseName}> {`)
    codes.push(`    return await this.${name}Model.create({ ...create${upCaseName}DTO, createBy: user })`)
    codes.push(`  }\n`)

    codes.push(`  // 分页查询数据`)
    codes.push(`  async list(pagination: Pagination): Promise<IList<I${upCaseName}>> {`)
    codes.push(`    const condition = this.paginationUtil.genCondition(pagination, []);`)
    codes.push(`    const list = await this.${name}Model`)
    codes.push(`      .find(condition)`)
    codes.push(`      .limit(pagination.pageSize)`)
    codes.push(`      .skip((pagination.current - 1) * pagination.pageSize)`)
    codes.push(`      .sort({ createdAt: -1 })`)
    codes.push(`      .lean()`)
    codes.push(`      .exec();`)
    codes.push(`    const total = await this.${name}Model.countDocuments(condition);`)
    codes.push(`    return { list, total };`)
    codes.push(`  }\n`)

    codes.push(`  // 修改数据`)
    codes.push(`  async update(id: string, create${upCaseName}DTO: Create${upCaseName}DTO): Promise<I${upCaseName} | null> {`)
    codes.push(`    return await this.${name}Model.findByIdAndUpdate(id, create${upCaseName}DTO)`)
    codes.push(`  }\n`)

    codes.push(`  // 详情`)
    codes.push(`  async detail(id: string): Promise<I${upCaseName}> {`)
    codes.push(`    const ${name} = await this.${name}Model.findById(id).lean().exec();`)
    codes.push(`    if (!${name}) {`)
    codes.push(`      throw new ApiException('数据不存在', ApiErrorCode.NO_EXIST, 404)`)
    codes.push(`    }`)
    codes.push(`    return ${name}`)
    codes.push(`  }\n`)

    codes.push(`  // 软删除`)
    codes.push(`  async remove(id: string, user: string) {`)
    codes.push(`    return await this.${name}Model.findByIdAndUpdate(id, { isDelete: true, deleteTime: Date.now(), deleteBy: user });`)
    codes.push(`  }\n`)

    codes.push(`  // 恢复`)
    codes.push(`  async recover(id: string) {`)
    codes.push(`    return await this.${name}Model.findByIdAndUpdate(id, { isDelete: false, $unset: { deleteTime: 1, deleteBy: 1 } });`)
    codes.push(`  }\n`)
    codes.push(`}`)
    fs.writeFileSync(`${path}/${name}.service.ts`, this.templateUtil.toString(codes, '\n'))
  }
}