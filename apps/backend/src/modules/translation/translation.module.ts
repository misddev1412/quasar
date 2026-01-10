import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Translation } from './entities/translation.entity';
import { TranslationRepository } from './repositories/translation.repository';
import { TranslationService } from './services/translation.service';
import { AdminTranslationService } from './services/admin-translation.service';
import { TranslationRouter } from '../../trpc/routers/translation.router';
import { AdminTranslationRouter } from './routers/admin-translation.router';
import { SharedModule } from '../shared/shared.module';
import { LanguageModule } from '../language/language.module';

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