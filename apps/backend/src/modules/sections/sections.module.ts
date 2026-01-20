import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SectionEntity } from './entities/section.entity';
import { SectionTranslationEntity } from './entities/section-translation.entity';
import { SectionRepository } from './repositories/section.repository';
import { SectionTranslationRepository } from './repositories/section-translation.repository';
import { SectionsService } from './services/sections.service';
import { LanguageModule } from '../language/language.module';
import { SharedModule } from '../shared/shared.module';
import { ComponentConfigsModule } from '../component-configs/component-configs.module';
import { ProductsModule } from '../products/products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SectionEntity,
      SectionTranslationEntity,
    ]),
    LanguageModule,
    SharedModule,
    ComponentConfigsModule,
    ProductsModule,
  ],
  providers: [
    SectionRepository,
    SectionTranslationRepository,
    SectionsService,
  ],
  exports: [
    SectionsService,
    SectionRepository,
    SectionTranslationRepository,
  ],
})
export class SectionsModule { }
