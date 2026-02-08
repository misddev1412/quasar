import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Language } from '@backend/modules/language/entities/language.entity';
import { LanguageRepository } from '@backend/modules/language/repositories/language.repository';
import { AdminLanguageService } from '@backend/modules/language/services/admin-language.service';
import { AdminLanguageRouter } from '@backend/modules/language/routers/admin-language.router';
import { ClientLanguageRouter } from '@backend/modules/language/routers/client-language.router';
import { SharedModule } from '@backend/modules/shared/shared.module';

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