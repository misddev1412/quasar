import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { SettingService } from '../services/setting.service';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { getSettingsByGroupSchema } from '../dto/setting.dto';

@Router({ alias: 'public.settings' })
@Injectable()
export class PublicSettingsRouter {
    constructor(
        @Inject(SettingService)
        private readonly settingService: SettingService,
        @Inject(ResponseService)
        private readonly responseService: ResponseService,
    ) { }

    @Query({
        input: getSettingsByGroupSchema,
        output: apiResponseSchema,
    })
    async getByGroup(@Input() input: z.infer<typeof getSettingsByGroupSchema>): Promise<z.infer<typeof apiResponseSchema>> {
        const settings = await this.settingService.findPublicByGroup(input.group);
        return this.responseService.createReadResponse(
            15, // ModuleCode.SETTINGS
            'settings',
            settings
        );
    }
}
