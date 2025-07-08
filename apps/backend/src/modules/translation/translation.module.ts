import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Translation } from './entities/translation.entity';
import { TranslationRepository } from './repositories/translation.repository';
import { TranslationService } from './services/translation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Translation])
  ],
  providers: [
    TranslationRepository,
    TranslationService
  ],
  exports: [
    TranslationService,
    TranslationRepository
  ]
})
export class TranslationModule {} 