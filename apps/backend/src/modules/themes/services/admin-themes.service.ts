import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import slugify from 'slugify';
import { ThemeRepository } from '../repositories/theme.repository';
import {
  CreateThemeDto,
  ThemeColorModesDto,
  ThemeColorModesPartialDto,
  ThemeFiltersDto,
  UpdateThemeDto,
} from '../dto/theme.dto';
import { ThemeEntity } from '../entities/theme.entity';
import { buildDefaultColorModes } from '../constants/theme-colors.constant';

@Injectable()
export class AdminThemesService {
  constructor(private readonly themeRepository: ThemeRepository) {}

  async getThemes(filters: ThemeFiltersDto) {
    return this.themeRepository.findWithFilters(filters);
  }

  async getThemeById(id: string): Promise<ThemeEntity> {
    const theme = await this.themeRepository.findById(id);
    if (!theme || theme.deletedAt) {
      throw new NotFoundException('Theme not found');
    }
    return theme;
  }

  async createTheme(dto: CreateThemeDto): Promise<ThemeEntity> {
    const slug = await this.generateUniqueSlug(dto.slug || dto.name);
    const themeEntity = this.themeRepository.create({
      name: dto.name,
      slug,
      description: dto.description,
      isActive: dto.isActive ?? true,
      colors: this.mergeColorModes(this.getDefaultColorModes(), dto.colors),
    });

    let savedTheme = await this.themeRepository.save(themeEntity);

    if (dto.isDefault) {
      savedTheme = await this.themeRepository.setDefault(savedTheme.id);
    }

    return savedTheme;
  }

  async updateTheme(id: string, dto: UpdateThemeDto): Promise<ThemeEntity> {
    const theme = await this.getThemeById(id);

    const updateData: Partial<ThemeEntity> = {};

    if (dto.name) {
      updateData.name = dto.name;
    }

    if (dto.description !== undefined) {
      updateData.description = dto.description;
    }

    if (typeof dto.isActive === 'boolean') {
      if (dto.isActive === false) {
        if (theme.isDefault) {
          throw new BadRequestException('Cannot deactivate the default theme');
        }
      }
      updateData.isActive = dto.isActive;
    }

    if (dto.colors) {
      updateData.colors = this.mergeColorModes(theme.colors ?? this.getDefaultColorModes(), dto.colors);
    }

    if (dto.slug || dto.name) {
      updateData.slug = await this.generateUniqueSlug(dto.slug || dto.name || 'theme', id);
    }

    const updated = await this.themeRepository.update(id, updateData);
    if (!updated) {
      throw new NotFoundException('Theme not found');
    }

    if (dto.isDefault) {
      return this.themeRepository.setDefault(id);
    }

    return updated;
  }

  async deleteTheme(id: string): Promise<void> {
    const theme = await this.getThemeById(id);
    if (theme.isDefault) {
      throw new BadRequestException('Cannot delete the default theme');
    }
    await this.themeRepository.softDelete(id);
  }

  async toggleThemeStatus(id: string): Promise<ThemeEntity> {
    const theme = await this.getThemeById(id);
    if (theme.isDefault && theme.isActive) {
      throw new BadRequestException('Cannot deactivate the default theme');
    }
    const toggled = await this.themeRepository.update(id, { isActive: !theme.isActive });
    if (!toggled) {
      throw new NotFoundException('Theme not found');
    }
    return toggled;
  }

  async setDefaultTheme(id: string): Promise<ThemeEntity> {
    await this.getThemeById(id);
    return this.themeRepository.setDefault(id);
  }

  private async generateUniqueSlug(source: string, ignoreId?: string): Promise<string> {
    const baseSlug =
      slugify(source, {
        lower: true,
        strict: true,
        trim: true,
      }) || 'theme';
    let attempt = baseSlug;
    let suffix = 1;

    // Attempt until slug free or belongs to same record
    while (true) {
      const existing = await this.themeRepository.findBySlug(attempt);
      if (!existing || existing.id === ignoreId) {
        return attempt;
      }
      suffix += 1;
      attempt = `${baseSlug}-${suffix}`;
    }
  }

  private getDefaultColorModes(): ThemeColorModesDto {
    return buildDefaultColorModes();
  }

  private mergeColorModes(
    base: ThemeColorModesDto,
    incoming: ThemeColorModesDto | ThemeColorModesPartialDto,
  ): ThemeColorModesDto {
    const safeBase = base || this.getDefaultColorModes();
    return {
      light: { ...safeBase.light, ...(incoming.light || {}) },
      dark: { ...safeBase.dark, ...(incoming.dark || {}) },
    };
  }
}
