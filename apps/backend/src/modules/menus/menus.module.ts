import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuEntity } from './entities/menu.entity';
import { MenuTranslationEntity } from './entities/menu-translation.entity';
import { MenuRepository } from './repositories/menu.repository';
import { MenuTranslationRepository } from './repositories/menu-translation.repository';
import { MenuService } from './services/menu.service';
import { AdminMenuRouter } from './routers/admin-menu.router';
import { ClientMenuRouter } from './routers/client-menu.router';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [TypeOrmModule.forFeature([MenuEntity, MenuTranslationEntity]), SharedModule],
  providers: [MenuService, MenuRepository, MenuTranslationRepository, AdminMenuRouter, ClientMenuRouter],
  exports: [MenuService, MenuRepository, MenuTranslationRepository],
})
export class MenuModule {}
