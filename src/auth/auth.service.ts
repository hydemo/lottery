import { Inject } from '@nestjs/common';
import { AdminService } from 'src/module/admin/admin.service';
import { UserService } from 'src/module/user/user.service';

export class AuthService {
    constructor(
        @Inject(UserService) private readonly userService: UserService,
        @Inject(AdminService) private readonly adminService: AdminService,
    ) { }

    async validateUser(payload: { type: string, id: string }): Promise<any> {
        if (payload.type === 'user') {
            return await this.userService.findById(payload.id);
        } else {
            return await this.adminService.findById(payload.id);
        }
    }
}