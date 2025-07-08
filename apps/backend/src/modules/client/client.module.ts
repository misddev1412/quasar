import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { UserProfile } from '../user/entities/user-profile.entity';
import { ClientUserRouter } from '../../trpc/routers/client-user.router';
import { ClientUserService } from './user/services/client-user.service';
import { AuthModule } from '../../auth/auth.module';
import { AuthMiddleware } from '../../trpc/middlewares/auth.middleware';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile]),
    AuthModule,
  ],
  controllers: [],
  providers: [
    ClientUserService,
    ClientUserRouter,
    AuthMiddleware,
  ],
  exports: [ClientUserService],
})
export class ClientModule {} 