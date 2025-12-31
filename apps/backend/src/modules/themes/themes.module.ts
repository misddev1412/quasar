import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThemeEntity } from './entities/theme.entity';
import { ThemeRepository } from './repositories/theme.repository';
import { AdminThemesService } from './services/admin-themes.service';
import { AdminThemesRouter } from './routers/admin-themes.router';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ThemeEntity]),
    SharedModule,
  ],
  providers: [
    ThemeRepository,
    AdminThemesService,
    AdminThemesRouter,
  ],
  exports: [
    ThemeRepository,
    AdminThemesService,
    AdminThemesRouter,
  ],
})
export class ThemesModule {}
