import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import slugify from 'slugify';
import { ThemeRepository } from '../repositories/theme.repository';
import { CreateThemeDto, ThemeColorConfigDto, ThemeFiltersDto, UpdateThemeDto } from '../dto/theme.dto';
import { ThemeEntity } from '../entities/theme.entity';

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
      mode: dto.mode ?? 'LIGHT',
      isActive: dto.isActive ?? true,
      ...this.toEntityColors(dto.colors),
    });

    let savedTheme = await this.themeRepository.save(themeEntity);

    if (dto.isDefault) {
      savedTheme = await this.themeRepository.setDefault(savedTheme.id);
    }

    return savedTheme;
  }

  async updateTheme(id: string, dto: UpdateThemeDto): Promise<ThemeEntity> {
    await this.getThemeById(id);

    const updateData: Partial<ThemeEntity> = {};

    if (dto.name) {
      updateData.name = dto.name;
    }

    if (dto.description !== undefined) {
      updateData.description = dto.description;
    }

    if (dto.mode) {
      updateData.mode = dto.mode;
    }

    if (typeof dto.isActive === 'boolean') {
      if (dto.isActive === false) {
        const theme = await this.getThemeById(id);
        if (theme.isDefault) {
          throw new BadRequestException('Cannot deactivate the default theme');
        }
      }
      updateData.isActive = dto.isActive;
    }

    if (dto.colors) {
      Object.assign(updateData, this.toEntityColors(dto.colors as ThemeColorConfigDto));
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

  private toEntityColors(colors: Partial<ThemeColorConfigDto>): Partial<ThemeEntity> {
    const mapped: Partial<ThemeEntity> = {};
    if (colors.bodyBackgroundColor) mapped.bodyBackgroundColor = colors.bodyBackgroundColor;
    if (colors.surfaceBackgroundColor) mapped.surfaceBackgroundColor = colors.surfaceBackgroundColor;
    if (colors.textColor) mapped.textColor = colors.textColor;
    if (colors.mutedTextColor) mapped.mutedTextColor = colors.mutedTextColor;
    if (colors.primaryColor) mapped.primaryColor = colors.primaryColor;
    if (colors.primaryTextColor) mapped.primaryTextColor = colors.primaryTextColor;
    if (colors.secondaryColor) mapped.secondaryColor = colors.secondaryColor;
    if (colors.secondaryTextColor) mapped.secondaryTextColor = colors.secondaryTextColor;
    if (colors.accentColor) mapped.accentColor = colors.accentColor;
    if (colors.borderColor) mapped.borderColor = colors.borderColor;
    return mapped;
  }
}
