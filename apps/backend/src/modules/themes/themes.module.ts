import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThemeEntity } from '@backend/modules/themes/entities/theme.entity';
import { ThemeRepository } from '@backend/modules/themes/repositories/theme.repository';
import { AdminThemesService } from '@backend/modules/themes/services/admin-themes.service';
import { AdminThemesRouter } from '@backend/modules/themes/routers/admin-themes.router';
import { SharedModule } from '@backend/modules/shared/shared.module';
import { PublicThemesService } from '@backend/modules/themes/services/public-themes.service';
import { PublicThemesRouter } from '@backend/modules/themes/routers/public-themes.router';

@Module({
  imports: [
    TypeOrmModule.forFeature([ThemeEntity]),
    SharedModule,
  ],
  providers: [
    ThemeRepository,
    AdminThemesService,
    AdminThemesRouter,
    PublicThemesService,
    PublicThemesRouter,
  ],
  exports: [
    ThemeRepository,
    AdminThemesService,
    AdminThemesRouter,
    PublicThemesService,
    PublicThemesRouter,
  ],
})
export class ThemesModule {}
