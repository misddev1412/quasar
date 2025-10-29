import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingEntity } from './entities/setting.entity';
import { SettingRepository } from './repositories/setting.repository';
import { SettingService } from './services/setting.service';
import { SharedModule } from '../shared/shared.module';
import { TranslationModule } from '../translation/translation.module';
import { AdminSettingsRouter } from './routers/admin-settings.router';
import { ClientSettingsRouter } from '../../trpc/routers/client';

@Module({
  imports: [
    TypeOrmModule.forFeature([SettingEntity]),
    SharedModule,
    TranslationModule,
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
