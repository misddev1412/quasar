import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SEOEntity } from './entities/seo.entity';
import { SEORepository } from './repositories/seo.repository';
import { SEOService } from './services/seo.service';
import { SharedModule } from '../shared/shared.module';
import { AdminSeoRouter } from '../../trpc/routers/admin/seo.router';
import { ClientSeoRouter } from '../../trpc/routers/client/seo.router';

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