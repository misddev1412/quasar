import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Translation } from '@backend/modules/translation/entities/translation.entity';
import { TranslationRepository } from '@backend/modules/translation/repositories/translation.repository';
import { TranslationService } from '@backend/modules/translation/services/translation.service';
import { AdminTranslationService } from '@backend/modules/translation/services/admin-translation.service';
import { TranslationRouter } from '@backend/trpc/routers/translation.router';
import { AdminTranslationRouter } from '@backend/modules/translation/routers/admin-translation.router';
import { SharedModule } from '@backend/modules/shared/shared.module';
import { LanguageModule } from '@backend/modules/language/language.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Translation]),
    SharedModule,
    LanguageModule
  ],
  providers: [
    TranslationRepository,
    TranslationService,
    AdminTranslationService,
    TranslationRouter,
    AdminTranslationRouter
  ],
  exports: [
    TranslationService,
    AdminTranslationService,
    TranslationRepository,
    TranslationRouter,
    AdminTranslationRouter
  ]
})
export class TranslationModule { } 