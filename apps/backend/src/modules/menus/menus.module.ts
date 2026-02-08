import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuEntity } from '@backend/modules/menus/entities/menu.entity';
import { MenuTranslationEntity } from '@backend/modules/menus/entities/menu-translation.entity';
import { MenuRepository } from '@backend/modules/menus/repositories/menu.repository';
import { MenuTranslationRepository } from '@backend/modules/menus/repositories/menu-translation.repository';
import { MenuService } from '@backend/modules/menus/services/menu.service';
import { AdminMenuRouter } from '@backend/modules/menus/routers/admin-menu.router';
import { ClientMenuRouter } from '@backend/modules/menus/routers/client-menu.router';
import { SharedModule } from '@backend/modules/shared/shared.module';
import { ImportModule } from '@backend/modules/import/import.module';

@Module({
  imports: [TypeOrmModule.forFeature([MenuEntity, MenuTranslationEntity]), SharedModule, ImportModule],
  providers: [MenuService, MenuRepository, MenuTranslationRepository, AdminMenuRouter, ClientMenuRouter],
  exports: [MenuService, MenuRepository, MenuTranslationRepository],
})
export class MenuModule { }
