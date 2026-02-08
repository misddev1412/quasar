import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SettingEntity } from '@backend/modules/settings/entities/setting.entity';
import { SettingRepository } from '@backend/modules/settings/repositories/setting.repository';
import { SettingService } from '@backend/modules/settings/services/setting.service';
import { SharedModule } from '@backend/modules/shared/shared.module';
import { TranslationModule } from '@backend/modules/translation/translation.module';
import { AdminSettingsRouter } from '@backend/modules/settings/routers/admin-settings.router';
import { ClientSettingsRouter } from '@backend/trpc/routers/client';
import { MaintenanceService } from '@backend/modules/settings/services/maintenance.service';
import { MaintenanceController } from '@backend/modules/settings/controllers/maintenance.controller';

import { PublicSettingsRouter } from '@backend/modules/settings/routers/public-settings.router';

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
