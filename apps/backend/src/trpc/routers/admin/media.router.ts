import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { MediaService } from '../../../modules/storage/services/media.service';
import { ResponseService } from '../../../modules/shared/services/response.service';
import { AuthMiddleware } from '../../middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../middlewares/admin-role.middleware';
import { apiResponseSchema } from '../../schemas/response.schemas';
import { AuthenticatedContext } from '../../context';
import {
  mediaListQuerySchema,
  updateMediaSchema,
  deleteMultipleMediaSchema,
  createMediaSchema,
} from '../../../modules/storage/dto/media.dto';

// Upload file schema for form data
const uploadMediaSchema = z.object({
  file: z.any(), // Will be handled by multer/file upload middleware
  metadata: createMediaSchema.optional(),
});

@Router({ alias: 'adminMedia' })
@Injectable()
export class AdminMediaRouter {
  constructor(
    @Inject(MediaService)
    private readonly mediaService: MediaService,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: mediaListQuerySchema.optional(),
    output: apiResponseSchema,
  })
  async getUserMedia(
    @Input() query: z.infer<typeof mediaListQuerySchema> = {},
    @Ctx() ctx: AuthenticatedContext,
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const result = await this.mediaService.getUserMedia(ctx.user.id, query);
      
      // Calculate total pages
      const totalPages = Math.ceil(result.total / (query.limit || 20));
      
      const response = {
        media: result.media,
        total: result.total,
        page: query.page || 1,
        limit: query.limit || 20,
        totalPages,
      };

      return this.responseHandler.createTrpcSuccess(response);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // Storage module code
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to get media files'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async getMediaById(
    @Input() input: { id: string },
    @Ctx() ctx: AuthenticatedContext,
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const media = await this.mediaService.getMediaById(input.id, ctx.user.id);
      return this.responseHandler.createTrpcSuccess(media);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // Storage module code
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to get media file'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({
      id: z.string().uuid(),
      data: updateMediaSchema,
    }),
    output: apiResponseSchema,
  })
  async updateMedia(
    @Input() input: { id: string; data: z.infer<typeof updateMediaSchema> },
    @Ctx() ctx: AuthenticatedContext,
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const updatedMedia = await this.mediaService.updateMedia(
        input.id,
        ctx.user.id,
        input.data
      );

      return this.responseHandler.createTrpcSuccess(updatedMedia);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // Storage module code
        3,  // OperationCode.UPDATE
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to update media file'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async deleteMedia(
    @Input() input: { id: string },
    @Ctx() ctx: AuthenticatedContext,
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      await this.mediaService.deleteMedia(input.id, ctx.user.id);
      return this.responseHandler.createTrpcSuccess({
        message: 'Media file deleted successfully',
      });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // Storage module code
        4,  // OperationCode.DELETE
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to delete media file'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: deleteMultipleMediaSchema,
    output: apiResponseSchema,
  })
  async deleteMultipleMedia(
    @Input() input: z.infer<typeof deleteMultipleMediaSchema>,
    @Ctx() ctx: AuthenticatedContext,
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const result = await this.mediaService.deleteMultipleMedia(input.ids, ctx.user.id);
      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // Storage module code
        4,  // OperationCode.DELETE
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to delete media files'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: apiResponseSchema,
  })
  async getMediaStats(
    @Ctx() ctx: AuthenticatedContext,
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const stats = await this.mediaService.getMediaStats(ctx.user.id);
      
      // Format the total size for display
      const formattedStats = {
        ...stats,
        sizeFormatted: this.formatFileSize(stats.totalSize),
      };

      return this.responseHandler.createTrpcSuccess(formattedStats);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // Storage module code
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to get media statistics'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({
      folder: z.string().optional(),
      limit: z.number().min(1).max(50).default(10),
    }),
    output: apiResponseSchema,
  })
  async getRecentMedia(
    @Input() input: { folder?: string; limit?: number },
    @Ctx() ctx: AuthenticatedContext,
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const query = {
        page: 1,
        limit: input.limit || 10,
        folder: input.folder,
        sortBy: 'createdAt' as const,
        sortOrder: 'DESC' as const,
      };

      const result = await this.mediaService.getUserMedia(ctx.user.id, query);
      return this.responseHandler.createTrpcSuccess(result.media);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        50, // Storage module code
        2,  // OperationCode.READ
        10, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to get recent media'
      );
    }
  }

  private formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = bytes / Math.pow(1024, i);
    
    return `${parseFloat(size.toFixed(2))} ${sizes[i]}`;
  }
}