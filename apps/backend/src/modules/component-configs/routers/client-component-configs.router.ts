import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { ComponentConfigsService } from '../services/component-configs.service';
import { ResponseService } from '../../shared/services/response.service';
import { apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { ModuleCode, OperationCode, ErrorLevelCode } from '@shared/enums/error-codes.enums';

const listByKeysSchema = z.object({
  componentKeys: z.array(z.string().min(1).max(150)).min(1),
  sectionId: z.string().uuid().optional().nullable(),
});

@Router({ alias: 'clientComponentConfigs' })
@Injectable()
export class ClientComponentConfigsRouter {
  constructor(
    @Inject(ComponentConfigsService)
    private readonly componentConfigsService: ComponentConfigsService,
    @Inject(ResponseService)
    private readonly responseService: ResponseService,
  ) {}

  @Query({
    input: listByKeysSchema,
    output: apiResponseSchema,
  })
  async listByKeys(@Input() input: z.infer<typeof listByKeysSchema>) {
    try {
      const sanitizedKeys = input.componentKeys
        .map((key) => key?.trim())
        .filter((key): key is string => Boolean(key));

      if (sanitizedKeys.length === 0) {
        return this.responseService.createReadResponse(ModuleCode.COMPONENT, 'componentConfigs', []);
      }

      const components = await this.componentConfigsService.listEnabledByKeys(sanitizedKeys, input.sectionId ?? undefined);
      const publicComponents = components.map((component) => ({
        id: component.id,
        componentKey: component.componentKey,
        displayName: component.displayName,
        defaultConfig: component.defaultConfig ?? {},
        metadata: component.metadata ?? {},
        slotKey: component.slotKey,
        parentId: component.parentId,
      }));

      return this.responseService.createReadResponse(ModuleCode.COMPONENT, 'componentConfigs', publicComponents);
    } catch (error) {
      throw this.responseService.createTRPCError(
        ModuleCode.COMPONENT,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Unable to load component configurations',
        error,
      );
    }
  }
}
