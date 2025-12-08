import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { MailTemplateService } from '../services/mail-template.service';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { ErrorLevelCode } from '@shared/enums/error-codes.enums';
import { apiResponseSchema, paginatedResponseSchema } from '../../../trpc/schemas/response.schemas';
import { AuthenticatedContext } from '../../../trpc/context';
import {
  createMailTemplateSchema,
  updateMailTemplateSchema,
  mailTemplateResponseSchema,
  mailTemplateListItemSchema,
  getMailTemplatesQuerySchema,
  processTemplateSchema,
  processedTemplateResponseSchema,
  cloneTemplateSchema,
} from '../dto/mail-template.dto';

// Response schemas
const getMailTemplatesResponseSchema = z.object({
  templates: z.array(mailTemplateListItemSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
});

const getTemplateTypesResponseSchema = z.array(z.string());

const getStatisticsResponseSchema = z.object({
  total: z.number(),
  active: z.number(),
  inactive: z.number(),
  byType: z.record(z.number()),
});

const bulkUpdateStatusSchema = z.object({
  ids: z.array(z.string().uuid()),
  isActive: z.boolean(),
});

@Router({ alias: 'adminMailTemplate' })
@Injectable()
export class AdminMailTemplateRouter {
  constructor(
    @Inject(MailTemplateService)
    private readonly mailTemplateService: MailTemplateService,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: createMailTemplateSchema,
    output: apiResponseSchema,
  })
  async createTemplate(
    @Input() input: z.infer<typeof createMailTemplateSchema>,
    @Ctx() ctx: AuthenticatedContext
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const template = await this.mailTemplateService.createTemplate(input as any, ctx.user.id);
      return this.responseHandler.createTrpcSuccess(template);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.MAIL_TEMPLATE
        1,  // OperationCode.CREATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to create mail template'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: getMailTemplatesQuerySchema,
    output: paginatedResponseSchema,
  })
  async getTemplates(
    @Input() input: z.infer<typeof getMailTemplatesQuerySchema>
  ): Promise<z.infer<typeof paginatedResponseSchema>> {
    try {
      const result = await this.mailTemplateService.getTemplates(input as any);
      return this.responseHandler.createTrpcSuccess({
        items: result.data,
        total: result.meta.total,
        page: result.meta.page,
        limit: result.meta.limit,
        totalPages: result.meta.totalPages,
      });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.MAIL_TEMPLATE
        2,  // OperationCode.READ
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to retrieve mail templates'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async getTemplateById(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const template = await this.mailTemplateService.getTemplateById(input.id);
      return this.responseHandler.createTrpcSuccess(template);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.MAIL_TEMPLATE
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Mail template not found'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ name: z.string() }),
    output: apiResponseSchema,
  })
  async getTemplateByName(
    @Input() input: { name: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const template = await this.mailTemplateService.getTemplateByName(input.name);
      return this.responseHandler.createTrpcSuccess(template);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.MAIL_TEMPLATE
        2,  // OperationCode.READ
        4,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Mail template not found'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string().uuid() }).merge(updateMailTemplateSchema),
    output: apiResponseSchema,
  })
  async updateTemplate(
    @Input() input: { id: string } & z.infer<typeof updateMailTemplateSchema>,
    @Ctx() ctx: AuthenticatedContext
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const { id, ...updateDto } = input;
      const template = await this.mailTemplateService.updateTemplate(id, updateDto, ctx.user.id);
      return this.responseHandler.createTrpcSuccess(template);
    } catch (error: any) {
      const message = error?.message || error?.error?.message || 'Failed to update mail template';
      const level = error?.error?.code === 409 ? ErrorLevelCode.CONFLICT : ErrorLevelCode.BUSINESS_LOGIC_ERROR;
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.MAIL_TEMPLATE
        3,  // OperationCode.UPDATE
        level,
        message
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async deleteTemplate(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      await this.mailTemplateService.deleteTemplate(input.id);
      return this.responseHandler.createTrpcSuccess({ deleted: true });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.MAIL_TEMPLATE
        4,  // OperationCode.DELETE
        error?.error?.code === 404 ? ErrorLevelCode.NOT_FOUND : ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to delete mail template'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: processTemplateSchema,
    output: apiResponseSchema,
  })
  async processTemplate(
    @Input() input: z.infer<typeof processTemplateSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const result = await this.mailTemplateService.processTemplate(input as any);
      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.MAIL_TEMPLATE
        5,  // OperationCode.EXECUTE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to process mail template'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: cloneTemplateSchema,
    output: apiResponseSchema,
  })
  async cloneTemplate(
    @Input() input: z.infer<typeof cloneTemplateSchema>,
    @Ctx() ctx: AuthenticatedContext
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const template = await this.mailTemplateService.cloneTemplate(
        input.templateId,
        input.newName,
        ctx.user.id
      );
      return this.responseHandler.createTrpcSuccess(template);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.MAIL_TEMPLATE
        1,  // OperationCode.CREATE
        error?.error?.code === 409 ? ErrorLevelCode.CONFLICT : ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to clone mail template'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async getTemplateTypes(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const types = await this.mailTemplateService.getTemplateTypes();
      return this.responseHandler.createTrpcSuccess(types);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.MAIL_TEMPLATE
        2,  // OperationCode.READ
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to retrieve template types'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async getStatistics(): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const statistics = await this.mailTemplateService.getStatistics();
      return this.responseHandler.createTrpcSuccess(statistics);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.MAIL_TEMPLATE
        2,  // OperationCode.READ
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to retrieve template statistics'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: bulkUpdateStatusSchema,
    output: apiResponseSchema,
  })
  async bulkUpdateStatus(
    @Input() input: z.infer<typeof bulkUpdateStatusSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const affectedCount = await this.mailTemplateService.bulkUpdateStatus(input.ids, input.isActive);
      return this.responseHandler.createTrpcSuccess({ affectedCount });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.MAIL_TEMPLATE
        3,  // OperationCode.UPDATE
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to bulk update template status'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ searchTerm: z.string().optional().default('') }),
    output: apiResponseSchema,
  })
  async searchTemplates(
    @Input() input: { searchTerm?: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const templates = await this.mailTemplateService.searchTemplates(input.searchTerm || '');
      return this.responseHandler.createTrpcSuccess(templates);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        15, // ModuleCode.MAIL_TEMPLATE
        2,  // OperationCode.READ
        30, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to search mail templates'
      );
    }
  }
}
