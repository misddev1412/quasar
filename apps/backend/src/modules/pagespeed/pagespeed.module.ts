import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SharedModule } from '@backend/modules/shared/shared.module';
import { SettingEntity } from '@backend/modules/settings/entities/setting.entity';
import { PageSpeedService } from '@backend/modules/pagespeed/services/page-speed.service';
import { PageSpeedConfigService } from '@backend/modules/pagespeed/services/page-speed-config.service';
import { AdminPageSpeedRouter } from '@backend/modules/pagespeed/routers/admin-page-speed.router';

@Module({
  imports: [TypeOrmModule.forFeature([SettingEntity]), SharedModule],
  providers: [PageSpeedService, PageSpeedConfigService, AdminPageSpeedRouter],
  exports: [PageSpeedService, PageSpeedConfigService, AdminPageSpeedRouter],
})
export class PageSpeedModule {}
