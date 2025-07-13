import { Injectable, Inject } from '@nestjs/common';
import { Router, Query, Mutation, Input } from 'nestjs-trpc';
import { AdminRoleService } from '@backend/modules/user/services/admin/admin-role.service';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { z } from 'zod';
import { apiResponseSchema } from '../../schemas/response.schemas';

@Router({ alias: 'adminRole' })
@Injectable()
export class AdminRoleRouter {
  constructor(
    @Inject(AdminRoleService)
    private readonly adminRoleService: AdminRoleService,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
  ) {}

  // We will add procedures for list, get, create, update, delete roles here.
  // For example:
  @Query({
    output: apiResponseSchema,
  })
  async getAllRoles(): Promise<z.infer<typeof apiResponseSchema>> {
    // const roles = await this.adminRoleService.findAll();
    // return this.responseHandler.createTrpcSuccess(roles);
    return this.responseHandler.createTrpcSuccess([]); // Placeholder
  }
} 