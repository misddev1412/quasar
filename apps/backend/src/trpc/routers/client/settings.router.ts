import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { SettingService } from '@backend/modules/settings/services/setting.service';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { apiResponseSchema } from '../../schemas/response.schemas';
import { getSettingByKeySchema } from '@backend/modules/settings/dto/setting.dto';
import { AuthenticatedContext } from '../../context';

@Router({ alias: 'settings' })
@Injectable()
export class ClientSettingsRouter {
  constructor(
    @Inject(SettingService)
    private readonly settingService: SettingService,
    @Inject(ResponseService)
    private readonly responseService: ResponseService,
  ) {}

  @Query({
    output: apiResponseSchema,
  })
  async getPublicSettings(): Promise<z.infer<typeof apiResponseSchema>> {
    const settings = await this.settingService.findPublicSettings();
    return this.responseService.createReadResponse(
      15, // ModuleCode.SETTINGS
      'settings',
      settings
    );
  }

  @Query({
    input: getSettingByKeySchema,
    output: apiResponseSchema,
  })
  async getPublicSetting(
    @Input() input: z.infer<typeof getSettingByKeySchema>,
    @Ctx() ctx: AuthenticatedContext
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const setting = await this.settingService.findByKey(input.key, ctx.locale);
      
      if (!setting.isPublic) {
        return this.responseService.createReadResponse(
          15, // ModuleCode.SETTINGS
          'settings',
          null
        );
      }
      
      return this.responseService.createReadResponse(
        15, // ModuleCode.SETTINGS
        'settings',
        setting
      );
    } catch (error) {
      return this.responseService.createReadResponse(
        15, // ModuleCode.SETTINGS
        'settings',
        null
      );
    }
  }
} 
