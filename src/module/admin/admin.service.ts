import { Model } from 'mongoose'
import { Inject, Injectable } from '@nestjs/common'
import { IAdmin } from './admin.interfaces'
import { CreateAdminDTO, ResetPassDTO } from './admin.dto'
import { CryptoUtil } from '@utils/crypto.util'
import { JwtService } from '@nestjs/jwt'
import { ApiErrorCode } from '@common/enum/api-error-code.enum'
import { ApiException } from '@common/expection/api.exception'
import { Pagination } from 'src/common/dto/pagination.dto';
import { IList } from 'src/common/interface/list.interface';
import { PaginationUtil } from 'src/utils/pagination.util';

@Injectable()
export class AdminService {
  constructor(
    @Inject('AdminModelToken') private readonly adminModel: Model<IAdmin>,
    @Inject(CryptoUtil) private readonly cryptoUtil: CryptoUtil,
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(PaginationUtil) private readonly paginationUtil: PaginationUtil,
  ) { }

  // 创建数据
  async create(createAdminDTO: CreateAdminDTO): Promise<IAdmin> {
    const existing = await this.adminModel.findOne({ username: createAdminDTO.username, isDelete: false })
    if (existing) {
      throw new ApiException('用户已存在', ApiErrorCode.USER_EXIST, 406)
    }

    // 新账号创建
    createAdminDTO.password = await this.cryptoUtil.encryptPassword(createAdminDTO.password)
    return await this.adminModel.create({ ...createAdminDTO, registerTime: Date.now() })
  }

  // 创建数据
  async list(pagination: Pagination): Promise<IList<IAdmin>> {
    const condition = this.paginationUtil.genCondition(pagination, ['nickname'])
    const list = await this.adminModel
      .find(condition)
      .limit(pagination.pageSize)
      .skip((pagination.current - 1) * pagination.pageSize)
      .sort({ createdAt: -1 })
      .select({ password: 0 })
      .lean()
      .exec();
    const total = await this.adminModel.countDocuments(condition);
    return { list, total };
  }

  // 根据id查找
  async findById(id: string): Promise<IAdmin> {
    return await this.adminModel.findById(id).lean().exec()
  }

  // 根据条件查询单条数据查找
  async findOne(condition: any): Promise<IAdmin> {
    return await this.adminModel.findOne(condition).lean().exec()
  }

  // 登陆
  async login(username: string, password: string, ip: string) {
    const admin: any = await this.adminModel.findOne({ username })
    // 判断账号是否存在
    if (!admin || admin.isDelete) {
      throw new ApiException('账号不存在', ApiErrorCode.NO_EXIST, 406)
    }
    if (!this.cryptoUtil.checkPassword(password, admin.password)) {
      throw new ApiException('密码错误', ApiErrorCode.PASSWORD_INVALID, 406)
    }
    const token = await this.jwtService.sign({ id: admin._id, type: 'admin' })
    await this.adminModel
      .findByIdAndUpdate(admin._id, { lastLoginTime: new Date(), lastLoginIp: ip })
      .lean()
      .exec()
    delete admin.password
    return { token, userinfo: admin }
  }


  // 重置密码
  async resetPassword(user: IAdmin, reset: ResetPassDTO) {
    const admin: any = await this.adminModel.findById(user._id)
    // 判断账号是否存在
    if (!admin || admin.isDelete) {
      throw new ApiException('无权限', ApiErrorCode.NO_PERMISSION, 403)
    }

    await this.cryptoUtil.checkPassword(reset.oldPassword, user.password)
    const password = await this.cryptoUtil.encryptPassword(reset.newPassword)
    await this.adminModel.findByIdAndUpdate(admin._id, { password });
    return;
  }

  // 重置密码
  async resetPasswordByAdmin(userId: string, password: string) {
    const newPass = await this.cryptoUtil.encryptPassword(password)
    await this.adminModel.findByIdAndUpdate(userId, { password: newPass });
    return;
  }

  // 删除
  async removeByAdmin(userId: string) {
    await this.adminModel.findByIdAndUpdate(userId, { isDelete: true, deleteTime: Date.now() });
    return;
  }

  // 恢复
  async recoverByAdmin(userId: string) {
    await this.adminModel.findByIdAndUpdate(userId, { isDelete: false, $unset: { deleteTime: 1 } });
    return;
  }

  // 修改数据
  async update(id: string, admin: CreateAdminDTO): Promise<IAdmin | null> {
    delete admin.password
    return await this.adminModel.findByIdAndUpdate(id, admin)
  }

}