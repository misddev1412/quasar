import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TRPCModule } from 'nestjs-trpc';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from '../modules/user/user.module';
import { AdminModule } from '../modules/admin/admin.module';
import { ClientModule } from '../modules/client/client.module';
import { AuthModule } from '../auth/auth.module';
import { AppContext } from '../trpc/context';
import databaseConfig from '../config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => configService.get('database'),
    }),
    AuthModule,
    TRPCModule.forRoot({
      autoSchemaFile: './src/@generated',
      context: AppContext,
    }),
    UserModule,
    AdminModule,
    ClientModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppContext],
})
export class AppModule {}
