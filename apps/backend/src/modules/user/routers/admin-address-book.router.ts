import { Injectable, Inject } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AdminAddressBookService } from '../services/admin-address-book.service';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { AdminRoleMiddleware } from '../../../trpc/middlewares/admin-role.middleware';
import { paginatedResponseSchema, apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { ModuleCode, OperationCode, ErrorLevelCode } from '@shared/enums/error-codes.enums';
import { AddressType } from '../entities/address-book.entity';
import { AdministrativeDivisionType } from '../../products/entities/administrative-division.entity';
import { ClientAddressBookService } from '../services/client-address-book.service';

export const addressTypeSchema = z.nativeEnum(AddressType);

export const createAddressBookSchema = z.object({
  customerId: z.string().uuid(),
  countryId: z.string(),
  provinceId: z.string().optional(),
  wardId: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  companyName: z.string().optional(),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  postalCode: z.string().optional(),
  phoneNumber: z.string().optional(),
  email: z.string().email().optional(),
  addressType: addressTypeSchema.default(AddressType.BOTH),
  isDefault: z.boolean().default(false),
  label: z.string().optional(),
  deliveryInstructions: z.string().optional(),
});

export const updateAddressBookSchema = createAddressBookSchema.partial().omit({ customerId: true });

export const getAddressBooksQuerySchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  customerId: z.string().uuid().optional(),
  countryId: z.string().optional(),
  addressType: addressTypeSchema.optional(),
});

const countryResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  iso2: z.string().nullable(),
  iso3: z.string().nullable(),
  phoneCode: z.string().nullable(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
});

const administrativeDivisionResponseSchema = z.object({
  id: z.string(),
  countryId: z.string(),
  parentId: z.string().nullable(),
  name: z.string(),
  code: z.string().nullable(),
  type: z.nativeEnum(AdministrativeDivisionType),
  i18nKey: z.string(),
  latitude: z.number().nullable(),
  longitude: z.number().nullable(),
});

const countryQuerySchema = z.object({
  countryId: z.string(),
  type: z.nativeEnum(AdministrativeDivisionType).optional(),
});

const parentQuerySchema = z.object({
  parentId: z.string(),
});

@Router({ alias: 'adminAddressBook' })
@Injectable()
export class AdminAddressBookRouter {
  constructor(
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
    @Inject(AdminAddressBookService)
    private readonly addressBookService: AdminAddressBookService,
    @Inject(ClientAddressBookService)
    private readonly clientAddressBookService: ClientAddressBookService,
  ) {}

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: getAddressBooksQuerySchema,
    output: paginatedResponseSchema,
  })
  async list(
    @Input() query: z.infer<typeof getAddressBooksQuerySchema>
  ): Promise<z.infer<typeof paginatedResponseSchema>> {
    try {
      const result = await this.addressBookService.getAllAddressBooks(
        query.page,
        query.limit,
        query.customerId,
        query.countryId,
        query.addressType,
      );
      return this.responseHandler.createTrpcSuccess(result);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.ADDRESS_BOOK,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Failed to retrieve address books'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    output: z.array(countryResponseSchema),
  })
  async getCountries(): Promise<z.infer<typeof countryResponseSchema>[]> {
    try {
      return await this.clientAddressBookService.getCountries();
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.ADDRESS_BOOK,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Failed to retrieve countries'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: countryQuerySchema,
    output: z.array(administrativeDivisionResponseSchema),
  })
  async getAdministrativeDivisions(
    @Input() input: z.infer<typeof countryQuerySchema>
  ): Promise<z.infer<typeof administrativeDivisionResponseSchema>[]> {
    try {
      return await this.clientAddressBookService.getAdministrativeDivisions(
        input.countryId,
        input.type
      );
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.ADDRESS_BOOK,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Failed to retrieve administrative divisions'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: parentQuerySchema,
    output: z.array(administrativeDivisionResponseSchema),
  })
  async getAdministrativeDivisionsByParentId(
    @Input() input: z.infer<typeof parentQuerySchema>
  ): Promise<z.infer<typeof administrativeDivisionResponseSchema>[]> {
    try {
      return await this.clientAddressBookService.getAdministrativeDivisionsByParentId(
        input.parentId
      );
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.ADDRESS_BOOK,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Failed to retrieve administrative divisions by parent ID'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async detail(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const addressBook = await this.addressBookService.getAddressBookById(input.id);
      if (!addressBook) {
        throw new Error('Address book entry not found');
      }
      return this.responseHandler.createTrpcSuccess(addressBook);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.ADDRESS_BOOK,
        OperationCode.READ,
        ErrorLevelCode.NOT_FOUND,
        error.message || 'Address book entry not found'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ customerId: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async getByCustomerId(
    @Input() input: { customerId: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const addressBooks = await this.addressBookService.getAddressBooksByCustomerId(input.customerId);
      return this.responseHandler.createTrpcSuccess(addressBooks);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.ADDRESS_BOOK,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Failed to retrieve customer address books'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({
      customerId: z.string().uuid(),
      addressType: addressTypeSchema,
    }),
    output: apiResponseSchema,
  })
  async getByCustomerIdAndType(
    @Input() input: { customerId: string; addressType: AddressType }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const addressBooks = await this.addressBookService.getAddressBooksByCustomerIdAndType(
        input.customerId,
        input.addressType
      );
      return this.responseHandler.createTrpcSuccess(addressBooks);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.ADDRESS_BOOK,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Failed to retrieve customer address books by type'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: createAddressBookSchema,
    output: apiResponseSchema,
  })
  async create(
    @Input() input: z.infer<typeof createAddressBookSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      await this.addressBookService.validateAddressBook(input);
      const addressBook = await this.addressBookService.createAddressBook(input);
      return this.responseHandler.createTrpcSuccess(addressBook);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.ADDRESS_BOOK,
        OperationCode.CREATE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to create address book entry'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string().uuid() }).merge(updateAddressBookSchema),
    output: apiResponseSchema,
  })
  async update(
    @Input() input: { id: string } & z.infer<typeof updateAddressBookSchema>
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const { id, ...updateDto } = input;
      const addressBook = await this.addressBookService.updateAddressBook(id, updateDto);
      return this.responseHandler.createTrpcSuccess(addressBook);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.ADDRESS_BOOK,
        OperationCode.UPDATE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to update address book entry'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async delete(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      await this.addressBookService.deleteAddressBook(input.id);
      return this.responseHandler.createTrpcResponse(
        200,
        'OK',
        { deleted: true }
      );
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.ADDRESS_BOOK,
        OperationCode.DELETE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to delete address book entry'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Mutation({
    input: z.object({ id: z.string().uuid() }),
    output: apiResponseSchema,
  })
  async setAsDefault(
    @Input() input: { id: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      await this.addressBookService.setAsDefault(input.id);
      return this.responseHandler.createTrpcSuccess({ message: 'Address set as default successfully' });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.ADDRESS_BOOK,
        OperationCode.UPDATE,
        ErrorLevelCode.BUSINESS_LOGIC_ERROR,
        error.message || 'Failed to set address as default'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware, AdminRoleMiddleware)
  @Query({
    input: z.object({ customerId: z.string().uuid().optional() }),
    output: apiResponseSchema,
  })
  async stats(
    @Input() input: { customerId?: string }
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      const stats = await this.addressBookService.getAddressBookStats(input.customerId);
      return this.responseHandler.createTrpcSuccess(stats);
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.ADDRESS_BOOK,
        OperationCode.READ,
        ErrorLevelCode.SERVER_ERROR,
        error.message || 'Failed to retrieve address book statistics'
      );
    }
  }
}
