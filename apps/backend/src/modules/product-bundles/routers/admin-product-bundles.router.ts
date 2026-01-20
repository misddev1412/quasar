import { Inject, Injectable } from '@nestjs/common';
import { Router, Query, Mutation, Input, UseMiddlewares } from 'nestjs-trpc';
import { z } from 'zod';
import { ProductBundlesService } from '../services/product-bundles.service';
import { ResponseService } from '../../shared/services/response.service';
import { apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import {
    createProductBundleSchema,
    updateProductBundleInputSchema,
    productBundleListInputSchema,
    productBundleIdSchema,
    CreateProductBundleDto,
} from '../dto/product-bundle.dto';
import { AuthenticatedContext } from '../../../trpc/context';
import { ModuleCode, OperationCode, ErrorLevelCode } from '@shared/enums/error-codes.enums';

@Router({ alias: 'productBundles' })
@Injectable()
@UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
export class AdminProductBundlesRouter {
    constructor(
        @Inject(ProductBundlesService)
        private readonly productBundlesService: ProductBundlesService,
        @Inject(ResponseService)
        private readonly responseService: ResponseService,
    ) { }

    @Query({
        input: productBundleListInputSchema,
        output: apiResponseSchema,
    })
    async list(@Input() input: z.infer<typeof productBundleListInputSchema>) {
        try {
            const [items, total] = await this.productBundlesService.findAll(input);
            return this.responseService.createReadResponse(ModuleCode.PRODUCT, 'productBundles', { items, total });
        } catch (error: any) {
            throw this.responseService.createTRPCError(
                ModuleCode.PRODUCT,
                OperationCode.READ,
                ErrorLevelCode.SERVER_ERROR,
                error.message || 'Failed to list product bundles',
                error,
            );
        }
    }

    @Query({
        input: productBundleIdSchema,
        output: apiResponseSchema,
    })
    async get(@Input() input: z.infer<typeof productBundleIdSchema>) {
        try {
            const bundle = await this.productBundlesService.findOne(input.id);
            return this.responseService.createReadResponse(ModuleCode.PRODUCT, 'productBundle', bundle);
        } catch (error: any) {
            throw this.responseService.createTRPCError(
                ModuleCode.PRODUCT,
                OperationCode.READ,
                ErrorLevelCode.SERVER_ERROR,
                error.message || 'Failed to get product bundle',
                error,
            );
        }
    }

    @Mutation({
        input: createProductBundleSchema,
        output: apiResponseSchema,
    })
    async create(@Input() input: CreateProductBundleDto) {
        try {
            const bundle = await this.productBundlesService.create(input);
            return this.responseService.createCreatedResponse(ModuleCode.PRODUCT, 'productBundle', bundle);
        } catch (error: any) {
            throw this.responseService.createTRPCError(
                ModuleCode.PRODUCT,
                OperationCode.CREATE,
                ErrorLevelCode.SERVER_ERROR,
                error.message || 'Failed to create product bundle',
                error,
            );
        }
    }

    @Mutation({
        input: updateProductBundleInputSchema,
        output: apiResponseSchema,
    })
    async update(@Input() input: z.infer<typeof updateProductBundleInputSchema>) {
        try {
            const bundle = await this.productBundlesService.update(input.id, input.data);
            return this.responseService.createUpdatedResponse(ModuleCode.PRODUCT, 'productBundle', bundle);
        } catch (error: any) {
            throw this.responseService.createTRPCError(
                ModuleCode.PRODUCT,
                OperationCode.UPDATE,
                ErrorLevelCode.SERVER_ERROR,
                error.message || 'Failed to update product bundle',
                error,
            );
        }
    }

    @Mutation({
        input: productBundleIdSchema,
        output: apiResponseSchema,
    })
    async delete(@Input() input: z.infer<typeof productBundleIdSchema>) {
        try {
            await this.productBundlesService.remove(input.id);
            return this.responseService.createDeletedResponse(ModuleCode.PRODUCT, 'productBundle');
        } catch (error: any) {
            throw this.responseService.createTRPCError(
                ModuleCode.PRODUCT,
                OperationCode.DELETE,
                ErrorLevelCode.SERVER_ERROR,
                error.message || 'Failed to delete product bundle',
                error,
            );
        }
    }
}
