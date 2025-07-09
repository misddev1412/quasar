import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TRPCModule } from 'nestjs-trpc';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from '../modules/user/user.module';
import { TranslationModule } from '../modules/translation/translation.module';
import { AuthModule } from '../auth/auth.module';
import { AppContext } from '../trpc/context';
import databaseConfig from '../config/database.config';
import { User } from '../modules/user/entities/user.entity';
import { UserProfile } from '../modules/user/entities/user-profile.entity';
import { Permission } from '../modules/user/entities/permission.entity';
import { Role } from '../modules/user/entities/role.entity';
import { UserRole } from '../modules/user/entities/user-role.entity';
import { RolePermission } from '../modules/user/entities/role-permission.entity';
import { Translation } from '../modules/translation/entities/translation.entity';
import * as trpcExpress from '@trpc/server/adapters/express';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ...configService.get('database'),
        entities: [
          User, 
          UserProfile, 
          Permission, 
          Role, 
          UserRole, 
          RolePermission,
          Translation
        ],
        autoLoadEntities: true
      }),
    }),
    AuthModule,
    TRPCModule.forRoot({
      context: AppContext,
      trpcOptions: {
        router: undefined, // Will be set by TRPCModule
        createContext: undefined, // Will be set by TRPCModule
        onError: ({ error, type, path, input, ctx, req }) => {
          console.error(`[TRPC] Error in ${type} ${path}:`, error);
        },
      },
      expressOptions: {
        createHandler: {
          responseMeta: ({ ctx, errors }) => {
            const error = errors[0];
            if (!error) {
              return {};
            }
            
            const errorCause = error.cause as any;
            const httpStatus = errorCause?.httpStatus || 500;
            
            return {
              status: httpStatus,
              headers: {
                'Content-Type': 'application/json',
              },
            };
          },
        },
      },
    }),
    UserModule,
    TranslationModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppContext],
})
export class AppModule {}
