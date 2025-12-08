import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SectionEntity } from './entities/section.entity';
import { SectionTranslationEntity } from './entities/section-translation.entity';
import { SectionRepository } from './repositories/section.repository';
import { SectionTranslationRepository } from './repositories/section-translation.repository';
import { SectionsService } from './services/sections.service';
import { LanguageModule } from '../language/language.module';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SectionEntity, SectionTranslationEntity]),
    LanguageModule,
    SharedModule,
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
export class SectionsModule {}
