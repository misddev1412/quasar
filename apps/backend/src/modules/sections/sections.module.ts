import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SectionEntity } from '@backend/modules/sections/entities/section.entity';
import { SectionTranslationEntity } from '@backend/modules/sections/entities/section-translation.entity';
import { SectionRepository } from '@backend/modules/sections/repositories/section.repository';
import { SectionTranslationRepository } from '@backend/modules/sections/repositories/section-translation.repository';
import { SectionsService } from '@backend/modules/sections/services/sections.service';
import { LanguageModule } from '@backend/modules/language/language.module';
import { SharedModule } from '@backend/modules/shared/shared.module';
import { ComponentConfigsModule } from '@backend/modules/component-configs/component-configs.module';
import { ProductsModule } from '@backend/modules/products/products.module';

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
