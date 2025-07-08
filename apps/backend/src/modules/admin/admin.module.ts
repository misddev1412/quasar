import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { UserProfile } from '../user/entities/user-profile.entity';
import { AdminUserRouter } from '../../trpc/routers/admin-user.router';
import { AdminUserService } from './user/services/admin-user.service';
import { AuthModule } from '../../auth/auth.module';
import { AuthMiddleware } from '../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../trpc/middlewares/admin-role.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile]),
    AuthModule,
  ],
  controllers: [],
  providers: [
    AdminUserService,
    AdminUserRouter,
    AuthMiddleware,
    AdminRoleMiddleware,
  ],
  exports: [AdminUserService],
})
export class AdminModule {} 