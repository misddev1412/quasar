import { Injectable, Inject } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { ClientAddressBookRouter as ProductsClientAddressBookRouter } from '../../../modules/products/routers/client-address-book.router';
import { AuthMiddleware } from '../../middlewares/auth.middleware';

@Router({ alias: 'addressBook' })
@Injectable()
export class ClientAddressBookRouter {
  constructor(
    @Inject(ProductsClientAddressBookRouter)
    private readonly productsClientAddressBookRouter: ProductsClientAddressBookRouter,
  ) {}

  // Forward all queries and mutations to the products router
  @UseMiddlewares(AuthMiddleware)
  @Query({
    output: z.any(),
  })
  async getAddresses(
    @Ctx() ctx: any
  ): Promise<any> {
    return this.productsClientAddressBookRouter.getAddresses(ctx);
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
    return this.productsClientAddressBookRouter.getAddressById(input, ctx);
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
    return this.productsClientAddressBookRouter.createAddress(input, ctx);
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
    return this.productsClientAddressBookRouter.updateAddress(input, ctx);
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
    return this.productsClientAddressBookRouter.deleteAddress(input, ctx);
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
    return this.productsClientAddressBookRouter.setDefaultAddress(input, ctx);
  }

  @UseMiddlewares(AuthMiddleware)
  @Query({
    output: z.any(),
  })
  async getDefaultAddress(
    @Ctx() ctx: any
  ): Promise<any> {
    return this.productsClientAddressBookRouter.getDefaultAddress(ctx);
  }

  @UseMiddlewares(AuthMiddleware)
  @Query({
    output: z.any(),
  })
  async getCountries(
    @Ctx() ctx: any
  ): Promise<any> {
    return this.productsClientAddressBookRouter.getCountries(ctx);
  }

  @UseMiddlewares(AuthMiddleware)
  @Query({
    input: z.object({ countryId: z.string() }),
    output: z.any(),
  })
  async getAdministrativeDivisions(
    @Input() input: { countryId: string },
    @Ctx() ctx: any
  ): Promise<any> {
    return this.productsClientAddressBookRouter.getAdministrativeDivisions(input, ctx);
  }
}