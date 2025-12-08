import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Translation } from './entities/translation.entity';
import { TranslationRepository } from './repositories/translation.repository';
import { TranslationService } from './services/translation.service';
import { TranslationRouter } from '../../trpc/routers/translation.router';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Translation]),
    SharedModule
  ],
  providers: [
    TranslationRepository,
    TranslationService,
    TranslationRouter
  ],
  exports: [
    TranslationService,
    TranslationRepository,
    TranslationRouter
  ]
})
export class TranslationModule {} 