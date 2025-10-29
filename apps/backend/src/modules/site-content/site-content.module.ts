import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteContentEntity } from './entities/site-content.entity';
import { SiteContentRepository } from './repositories/site-content.repository';
import { AdminSiteContentService } from './services/admin-site-content.service';
import { ClientSiteContentService } from './services/client-site-content.service';
import { AdminSiteContentRouter } from './routers/admin-site-content.router';
import { ClientSiteContentRouter } from './routers/client-site-content.router';
import { SharedModule } from '../shared/shared.module';

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
