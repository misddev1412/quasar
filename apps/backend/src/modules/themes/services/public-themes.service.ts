import { Injectable, NotFoundException } from '@nestjs/common';
import { ThemeRepository } from '../repositories/theme.repository';
import { ThemeEntity } from '../entities/theme.entity';

@Injectable()
export class PublicThemesService {
  constructor(private readonly themeRepository: ThemeRepository) {}

  async getActiveTheme(): Promise<ThemeEntity> {
    const theme = await this.themeRepository.findDefault();
    if (!theme) {
      throw new NotFoundException('Default theme not configured');
    }
    return theme;
  }
}
