import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SEOEntity } from '@backend/modules/seo/entities/seo.entity';
import { SEORepository } from '@backend/modules/seo/repositories/seo.repository';
import { SEOService } from '@backend/modules/seo/services/seo.service';
import { SharedModule } from '@backend/modules/shared/shared.module';
import { AdminSeoRouter } from '@backend/modules/seo/routers/admin-seo.router';
import { ClientSeoRouter } from '@backend/trpc/routers/client/seo.router';

@Module({
  imports: [
    TypeOrmModule.forFeature([SEOEntity]),
    SharedModule,
  ],
  providers: [
    SEORepository, 
    SEOService,
    AdminSeoRouter,
    ClientSeoRouter
  ],
  exports: [
    SEOService,
    AdminSeoRouter,
    ClientSeoRouter
  ],
})
export class SEOModule {} 