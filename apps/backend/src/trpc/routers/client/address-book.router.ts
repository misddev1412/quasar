import { Injectable, Inject } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { ClientAddressBookRouter as UserClientAddressBookRouter } from '../../../modules/user/routers/client-address-book.router';
import { AuthMiddleware } from '../../middlewares/auth.middleware';

@Router({ alias: 'addressBook' })
@Injectable()
export class ClientAddressBookRouter {
  constructor(
    @Inject(UserClientAddressBookRouter)
    private readonly userClientAddressBookRouter: UserClientAddressBookRouter,
  ) {}

  // Forward all queries and mutations to the products router
  @UseMiddlewares(AuthMiddleware)
  @Query({
    output: z.any(),
  })
  async getAddresses(
    @Ctx() ctx: any
  ): Promise<any> {
    return this.userClientAddressBookRouter.getAddresses(ctx);
  }

  @UseMiddlewares(AuthMiddleware)
  @Query({
    input: z.object({ id: z.string() }),
    output: z.any(),
  })
  async getAddressById(
    @Input() input: { id: string },
    @Ctx() ctx: any
  ): Promise<any> {
    return this.userClientAddressBookRouter.getAddressById(input, ctx);
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: z.any(),
    output: z.any(),
  })
  async createAddress(
    @Input() input: any,
    @Ctx() ctx: any
  ): Promise<any> {
    return this.userClientAddressBookRouter.createAddress(input, ctx);
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: z.object({ id: z.string(), data: z.any() }),
    output: z.any(),
  })
  async updateAddress(
    @Input() input: { id: string; data: any },
    @Ctx() ctx: any
  ): Promise<any> {
    return this.userClientAddressBookRouter.updateAddress(input, ctx);
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: z.object({ id: z.string() }),
    output: z.any(),
  })
  async deleteAddress(
    @Input() input: { id: string },
    @Ctx() ctx: any
  ): Promise<any> {
    return this.userClientAddressBookRouter.deleteAddress(input, ctx);
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: z.object({ id: z.string() }),
    output: z.any(),
  })
  async setDefaultAddress(
    @Input() input: { id: string },
    @Ctx() ctx: any
  ): Promise<any> {
    return this.userClientAddressBookRouter.setDefaultAddress(input, ctx);
  }

  @UseMiddlewares(AuthMiddleware)
  @Query({
    output: z.any(),
  })
  async getDefaultAddress(
    @Ctx() ctx: any
  ): Promise<any> {
    return this.userClientAddressBookRouter.getDefaultAddress(ctx);
  }

  @UseMiddlewares(AuthMiddleware)
  @Query({
    output: z.any(),
  })
  async getCountries(
    @Ctx() ctx: any
  ): Promise<any> {
    return this.userClientAddressBookRouter.getCountries(ctx);
  }

  @UseMiddlewares(AuthMiddleware)
  @Query({
    input: z.object({ countryId: z.string(), type: z.string().optional() }),
    output: z.any(),
  })
  async getAdministrativeDivisions(
    @Input() input: { countryId: string; type?: string },
    @Ctx() ctx: any
  ): Promise<any> {
    return this.userClientAddressBookRouter.getAdministrativeDivisions(input, ctx);
  }

  @UseMiddlewares(AuthMiddleware)
  @Query({
    input: z.object({ parentId: z.string() }),
    output: z.any(),
  })
  async getAdministrativeDivisionsByParentId(
    @Input() input: { parentId: string },
    @Ctx() ctx: any
  ): Promise<any> {
    return this.userClientAddressBookRouter.getAdministrativeDivisionsByParentId(input, ctx);
  }
}