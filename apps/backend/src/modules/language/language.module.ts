import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Language } from './entities/language.entity';
import { LanguageRepository } from './repositories/language.repository';
import { AdminLanguageService } from './services/admin-language.service';
import { AdminLanguageRouter } from './routers/admin-language.router';
import { ClientLanguageRouter } from './routers/client-language.router';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Language]),
    SharedModule,
  ],
  providers: [
    LanguageRepository,
    AdminLanguageService,
    AdminLanguageRouter,
    ClientLanguageRouter,
  ],
  exports: [
    LanguageRepository,
    AdminLanguageService,
    AdminLanguageRouter,
    ClientLanguageRouter,
  ],
})
export class LanguageModule {}