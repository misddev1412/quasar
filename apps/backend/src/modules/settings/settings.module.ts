import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingEntity } from './entities/setting.entity';
import { SettingRepository } from './repositories/setting.repository';
import { SettingService } from './services/setting.service';
import { SharedModule } from '../shared/shared.module';
import { TranslationModule } from '../translation/translation.module';
import { AdminSettingsRouter } from './routers/admin-settings.router';
import { ClientSettingsRouter } from '../../trpc/routers/client';
import { MaintenanceService } from './services/maintenance.service';
import { MaintenanceController } from './controllers/maintenance.controller';

import { PublicSettingsRouter } from './routers/public-settings.router';

@Module({
  imports: [
    TypeOrmModule.forFeature([SettingEntity]),
    SharedModule,
    TranslationModule,
  ],
  providers: [
    SettingRepository,
    SettingService,
    MaintenanceService,
    AdminSettingsRouter,
    ClientSettingsRouter,
    PublicSettingsRouter
  ],
  controllers: [MaintenanceController],
  exports: [
    SettingService,
    MaintenanceService,
    AdminSettingsRouter,
    ClientSettingsRouter,
    PublicSettingsRouter
  ],
})
export class SettingsModule { } 
