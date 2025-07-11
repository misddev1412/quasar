import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingEntity } from './entities/setting.entity';
import { SettingRepository } from './repositories/setting.repository';
import { SettingService } from './services/setting.service';
import { SharedModule } from '../shared/shared.module';
import { AdminSettingsRouter } from '../../trpc/routers/admin/settings.router';
import { ClientSettingsRouter } from '../../trpc/routers/client/settings.router';

@Module({
  imports: [
    TypeOrmModule.forFeature([SettingEntity]),
    SharedModule,
  ],
  providers: [
    SettingRepository, 
    SettingService,
    AdminSettingsRouter,
    ClientSettingsRouter
  ],
  exports: [
    SettingService,
    AdminSettingsRouter,
    ClientSettingsRouter
  ],
})
export class SettingsModule {} 