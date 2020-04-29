import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { UserService } from './user.service';
import { usersProviders } from './user.providers';
import { DatabaseModule } from 'src/database/database.module';


@Module({
  providers: [
    UserService,
    ...usersProviders,
  ],
  exports: [UserService],
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    DatabaseModule,
  ],
})

export class UserModule { }
