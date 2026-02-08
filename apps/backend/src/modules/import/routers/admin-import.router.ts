
import { Injectable, Inject } from '@nestjs/common';
import { Router, Query, Input, UseMiddlewares } from 'nestjs-trpc';
import { z } from 'zod';
import { ImportJobService } from '@backend/modules/import/services/import-job.service';
import { AuthMiddleware } from '@backend/trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '@backend/trpc/middlewares/admin-role.middleware';
import { apiResponseSchema } from '@backend/trpc/schemas/response.schemas';
import { ResponseService } from '@backend/modules/shared/services/response.service';

@Router({ alias: 'adminImport' })
@Injectable()
export class AdminImportRouter {
    constructor(
        @Inject(ImportJobService)
        private readonly importJobService: ImportJobService,
        @Inject(ResponseService)
        private readonly responseHandler: ResponseService,
    ) { }

    @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
    @Query({
        input: z.object({ id: z.string() }),
        output: apiResponseSchema,
    })
    async getJobStatus(
        @Input() input: { id: string }
    ) {
        try {
            const job = await this.importJobService.getJob(input.id);
            return this.responseHandler.createTrpcSuccess(job);
        } catch (error) {
            throw this.responseHandler.createTRPCError(
                15, // ModuleCode
                2,  // OperationCode.READ
                10, // ErrorLevelCode
                error.message || 'Failed to get job status'
            );
        }
    }
}
