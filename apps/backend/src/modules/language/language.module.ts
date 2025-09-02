import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Language } from './entities/language.entity';
import { LanguageRepository } from './repositories/language.repository';
import { AdminLanguageService } from './services/admin-language.service';

@Module({
  imports: [TypeOrmModule.forFeature([Language])],
  providers: [LanguageRepository, AdminLanguageService],
  exports: [LanguageRepository, AdminLanguageService],
})
export class LanguageModule {}