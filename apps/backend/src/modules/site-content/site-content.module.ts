import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteContentEntity } from '@backend/modules/site-content/entities/site-content.entity';
import { SiteContentRepository } from '@backend/modules/site-content/repositories/site-content.repository';
import { AdminSiteContentService } from '@backend/modules/site-content/services/admin-site-content.service';
import { ClientSiteContentService } from '@backend/modules/site-content/services/client-site-content.service';
import { AdminSiteContentRouter } from '@backend/modules/site-content/routers/admin-site-content.router';
import { ClientSiteContentRouter } from '@backend/modules/site-content/routers/client-site-content.router';
import { SharedModule } from '@backend/modules/shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SiteContentEntity]),
    SharedModule,
  ],
  providers: [
    SiteContentRepository,
    AdminSiteContentService,
    ClientSiteContentService,
    AdminSiteContentRouter,
    ClientSiteContentRouter,
  ],
  exports: [
    SiteContentRepository,
    AdminSiteContentService,
    ClientSiteContentService,
  ],
})
export class SiteContentModule {}
