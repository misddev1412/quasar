import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuEntity } from './entities/menu.entity';
import { MenuTranslationEntity } from './entities/menu-translation.entity';
import { MenuRepository } from './repositories/menu.repository';
import { MenuTranslationRepository } from './repositories/menu-translation.repository';
import { MenuService } from './services/menu.service';

@Module({
  imports: [TypeOrmModule.forFeature([MenuEntity, MenuTranslationEntity])],
  providers: [MenuService, MenuRepository, MenuTranslationRepository],
  exports: [MenuService, MenuRepository, MenuTranslationRepository],
})
export class MenuModule {}