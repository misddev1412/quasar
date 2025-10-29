import { Injectable, Inject } from '@nestjs/common';
import { Router, Query, Mutation, UseMiddlewares, Input, Ctx } from 'nestjs-trpc';
import { z } from 'zod';
import { ClientAddressBookService } from '../services/client-address-book.service';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { AuthMiddleware } from '../../../trpc/middlewares/auth.middleware';
import { apiResponseSchema } from '../../../trpc/schemas/response.schemas';
import { AuthenticatedContext } from '../../../trpc/context';
import { AddressType } from '../entities/address-book.entity';
import { AdministrativeDivisionType } from '../../products/entities/administrative-division.entity';
import { ModuleCode, OperationCode } from '@shared/enums/error-codes.enums';
import { ErrorLevelCode } from '@shared/enums/error-codes.enums';

// Zod schemas for validation
const createAddressSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  postalCode: z.string().optional(),
  phoneNumber: z.string().optional(),
  email: z.string().email().optional(),
  companyName: z.string().optional(),
  countryId: z.string(),
  provinceId: z.string().optional(),
  wardId: z.string().optional(),
  addressType: z.nativeEnum(AddressType).optional().default(AddressType.BOTH),
  isDefault: z.boolean().optional().default(false),
  label: z.string().optional(),
  deliveryInstructions: z.string().optional(),
});

const updateAddressSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  addressLine1: z.string().min(1).optional(),
  addressLine2: z.string().optional(),
  postalCode: z.string().optional(),
  phoneNumber: z.string().optional(),
  email: z.string().email().optional(),
  companyName: z.string().optional(),
  countryId: z.string().optional(),
  provinceId: z.string().optional(),
  wardId: z.string().optional(),
  addressType: z.nativeEnum(AddressType).optional(),
  isDefault: z.boolean().optional(),
  label: z.string().optional(),
  deliveryInstructions: z.string().optional(),
});

const addressIdSchema = z.object({
  id: z.string(),
});

const countryQuerySchema = z.object({
  countryId: z.string(),
  type: z.string().optional(),
});

const parentQuerySchema = z.object({
  parentId: z.string(),
});

const addressBookResponseSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  countryId: z.string(),
  provinceId: z.string().nullable(),
  wardId: z.string().nullable(),
  firstName: z.string(),
  lastName: z.string(),
  companyName: z.string().nullable(),
  addressLine1: z.string(),
  addressLine2: z.string().nullable(),
  postalCode: z.string().nullable(),
  phoneNumber: z.string().nullable(),
  email: z.string().nullable(),
  addressType: z.nativeEnum(AddressType),
  isDefault: z.boolean(),
  label: z.string().nullable(),
  deliveryInstructions: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  fullName: z.string(),
  formattedAddress: z.string(),
  displayLabel: z.string(),
  isShippingAddress: z.boolean(),
  isBillingAddress: z.boolean(),
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

@Router({ alias: 'clientAddressBook' })
@Injectable()
export class ClientAddressBookRouter {
  constructor(
    @Inject(ClientAddressBookService)
    private readonly addressBookService: ClientAddressBookService,
    @Inject(ResponseService)
    private readonly responseHandler: ResponseService,
  ) {}


  @UseMiddlewares(AuthMiddleware)
  @Query({
    output: z.array(addressBookResponseSchema),
  })
  async getAddresses(
    @Ctx() { user }: AuthenticatedContext
  ): Promise<z.infer<typeof addressBookResponseSchema>[]> {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const addresses = await this.addressBookService.getAddressBooksByUserId(user.id);

      // Transform addresses to include virtual properties
      return addresses.map(address => ({
        id: address.id,
        customerId: address.customerId,
        countryId: address.countryId,
        provinceId: address.provinceId,
        wardId: address.wardId,
        firstName: address.firstName,
        lastName: address.lastName,
        companyName: address.companyName,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        postalCode: address.postalCode,
        phoneNumber: address.phoneNumber,
        email: address.email,
        addressType: address.addressType,
        isDefault: address.isDefault,
        label: address.label,
        deliveryInstructions: address.deliveryInstructions,
        createdAt: address.createdAt,
        updatedAt: address.updatedAt,
        fullName: address.fullName,
        formattedAddress: address.formattedAddress,
        displayLabel: address.displayLabel,
        isShippingAddress: address.isShippingAddress,
        isBillingAddress: address.isBillingAddress,
      }));
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.ADDRESS_BOOK,
        OperationCode.READ,  // OperationCode.READ
        ErrorLevelCode.NOT_FOUND,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Failed to retrieve addresses'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware)
  @Query({
    input: addressIdSchema,
    output: addressBookResponseSchema,
  })
  async getAddressById(
    @Input() input: z.infer<typeof addressIdSchema>,
    @Ctx() { user }: AuthenticatedContext
  ): Promise<z.infer<typeof addressBookResponseSchema>> {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const address = await this.addressBookService.getAddressBookById(input.id, user.id);

      if (!address) {
        throw this.responseHandler.createTRPCError(
          ModuleCode.ADDRESS_BOOK,
          OperationCode.READ,  // OperationCode.READ
          ErrorLevelCode.NOT_FOUND,  // ErrorLevelCode.NOT_FOUND
          'Address not found'
        );
      }

      return {
        id: address.id,
        customerId: address.customerId,
        countryId: address.countryId,
        provinceId: address.provinceId,
        wardId: address.wardId,
        firstName: address.firstName,
        lastName: address.lastName,
        companyName: address.companyName,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        postalCode: address.postalCode,
        phoneNumber: address.phoneNumber,
        email: address.email,
        addressType: address.addressType,
        isDefault: address.isDefault,
        label: address.label,
        deliveryInstructions: address.deliveryInstructions,
        createdAt: address.createdAt,
        updatedAt: address.updatedAt,
        fullName: address.fullName,
        formattedAddress: address.formattedAddress,
        displayLabel: address.displayLabel,
        isShippingAddress: address.isShippingAddress,
        isBillingAddress: address.isBillingAddress,
      };
    } catch (error) {
      if (error.statusCode) {
        throw error; // Re-throw TRPC errors
      }
      throw this.responseHandler.createTRPCError(
        ModuleCode.ADDRESS_BOOK,
        OperationCode.READ,  // OperationCode.READ
        ErrorLevelCode.NOT_FOUND,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Failed to retrieve address'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: createAddressSchema,
    output: addressBookResponseSchema,
  })
  async createAddress(
    @Input() addressData: z.infer<typeof createAddressSchema>,
    @Ctx() { user }: AuthenticatedContext
  ): Promise<z.infer<typeof addressBookResponseSchema>> {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const address = await this.addressBookService.createAddressBook(user.id, addressData);

      return {
        id: address.id,
        customerId: address.customerId,
        countryId: address.countryId,
        provinceId: address.provinceId,
        wardId: address.wardId,
        firstName: address.firstName,
        lastName: address.lastName,
        companyName: address.companyName,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        postalCode: address.postalCode,
        phoneNumber: address.phoneNumber,
        email: address.email,
        addressType: address.addressType,
        isDefault: address.isDefault,
        label: address.label,
        deliveryInstructions: address.deliveryInstructions,
        createdAt: address.createdAt,
        updatedAt: address.updatedAt,
        fullName: address.fullName,
        formattedAddress: address.formattedAddress,
        displayLabel: address.displayLabel,
        isShippingAddress: address.isShippingAddress,
        isBillingAddress: address.isBillingAddress,
      };
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.ADDRESS_BOOK,
        OperationCode.CREATE,  // OperationCode.CREATE
        ErrorLevelCode.BUSINESS_LOGIC_ERROR, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to create address'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: z.object({
      id: z.string(),
      data: updateAddressSchema,
    }),
    output: addressBookResponseSchema,
  })
  async updateAddress(
    @Input() input: { id: string; data: z.infer<typeof updateAddressSchema> },
    @Ctx() { user }: AuthenticatedContext
  ): Promise<z.infer<typeof addressBookResponseSchema>> {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const address = await this.addressBookService.updateAddressBook(input.id, user.id, input.data);

      if (!address) {
        throw this.responseHandler.createTRPCError(
          ModuleCode.ADDRESS_BOOK,
          OperationCode.UPDATE,  // OperationCode.UPDATE
          ErrorLevelCode.NOT_FOUND,  // ErrorLevelCode.NOT_FOUND
          'Address not found'
        );
      }

      return {
        id: address.id,
        customerId: address.customerId,
        countryId: address.countryId,
        provinceId: address.provinceId,
        wardId: address.wardId,
        firstName: address.firstName,
        lastName: address.lastName,
        companyName: address.companyName,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        postalCode: address.postalCode,
        phoneNumber: address.phoneNumber,
        email: address.email,
        addressType: address.addressType,
        isDefault: address.isDefault,
        label: address.label,
        deliveryInstructions: address.deliveryInstructions,
        createdAt: address.createdAt,
        updatedAt: address.updatedAt,
        fullName: address.fullName,
        formattedAddress: address.formattedAddress,
        displayLabel: address.displayLabel,
        isShippingAddress: address.isShippingAddress,
        isBillingAddress: address.isBillingAddress,
      };
    } catch (error) {
      if (error.statusCode) {
        throw error; // Re-throw TRPC errors
      }
      throw this.responseHandler.createTRPCError(
        ModuleCode.ADDRESS_BOOK,
        OperationCode.UPDATE,  // OperationCode.UPDATE
        ErrorLevelCode.BUSINESS_LOGIC_ERROR, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to update address'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: addressIdSchema,
    output: apiResponseSchema,
  })
  async deleteAddress(
    @Input() input: z.infer<typeof addressIdSchema>,
    @Ctx() { user }: AuthenticatedContext
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      await this.addressBookService.deleteAddressBook(input.id, user.id);

      return this.responseHandler.createTrpcSuccess({ message: 'Address deleted successfully' });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.ADDRESS_BOOK,
        OperationCode.DELETE,  // OperationCode.DELETE
        ErrorLevelCode.BUSINESS_LOGIC_ERROR, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to delete address'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware)
  @Mutation({
    input: addressIdSchema,
    output: apiResponseSchema,
  })
  async setDefaultAddress(
    @Input() input: z.infer<typeof addressIdSchema>,
    @Ctx() { user }: AuthenticatedContext
  ): Promise<z.infer<typeof apiResponseSchema>> {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      await this.addressBookService.setAsDefault(input.id, user.id);

      return this.responseHandler.createTrpcSuccess({ message: 'Address set as default successfully' });
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.ADDRESS_BOOK,
        OperationCode.UPDATE,  // OperationCode.UPDATE
        ErrorLevelCode.BUSINESS_LOGIC_ERROR, // ErrorLevelCode.BUSINESS_LOGIC_ERROR
        error.message || 'Failed to set default address'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware)
  @Query({
    output: addressBookResponseSchema.nullable(),
  })
  async getDefaultAddress(
    @Ctx() { user }: AuthenticatedContext
  ): Promise<z.infer<typeof addressBookResponseSchema> | null> {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const address = await this.addressBookService.getDefaultAddressBook(user.id);

      if (!address) {
        return null;
      }

      return {
        id: address.id,
        customerId: address.customerId,
        countryId: address.countryId,
        provinceId: address.provinceId,
        wardId: address.wardId,
        firstName: address.firstName,
        lastName: address.lastName,
        companyName: address.companyName,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        postalCode: address.postalCode,
        phoneNumber: address.phoneNumber,
        email: address.email,
        addressType: address.addressType,
        isDefault: address.isDefault,
        label: address.label,
        deliveryInstructions: address.deliveryInstructions,
        createdAt: address.createdAt,
        updatedAt: address.updatedAt,
        fullName: address.fullName,
        formattedAddress: address.formattedAddress,
        displayLabel: address.displayLabel,
        isShippingAddress: address.isShippingAddress,
        isBillingAddress: address.isBillingAddress,
      };
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.ADDRESS_BOOK,
        OperationCode.READ,  // OperationCode.READ
        ErrorLevelCode.NOT_FOUND,  // ErrorLevelCode.NOT_FOUND
        error.message || 'Failed to retrieve default address'
      );
    }
  }

  @Query({
    output: z.array(countryResponseSchema),
  })
  async getCountries(
    @Ctx() _context: AuthenticatedContext
  ): Promise<z.infer<typeof countryResponseSchema>[]> {
    try {
      const countries = await this.addressBookService.getCountries();
      return countries;
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.ADDRESS_BOOK,
        OperationCode.READ,  // OperationCode.READ
        ErrorLevelCode.SERVER_ERROR, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve countries'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware)
  @Query({
    input: countryQuerySchema,
    output: z.array(administrativeDivisionResponseSchema),
  })
  async getAdministrativeDivisions(
    @Input() input: z.infer<typeof countryQuerySchema>,
    @Ctx() { user }: AuthenticatedContext
  ): Promise<z.infer<typeof administrativeDivisionResponseSchema>[]> {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const divisions = await this.addressBookService.getAdministrativeDivisions(
        input.countryId,
        input.type
      );
      return divisions;
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.ADDRESS_BOOK,
        OperationCode.READ,  // OperationCode.READ
        ErrorLevelCode.SERVER_ERROR, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve administrative divisions'
      );
    }
  }

  @UseMiddlewares(AuthMiddleware)
  @Query({
    input: parentQuerySchema,
    output: z.array(administrativeDivisionResponseSchema),
  })
  async getAdministrativeDivisionsByParentId(
    @Input() input: z.infer<typeof parentQuerySchema>,
    @Ctx() { user }: AuthenticatedContext
  ): Promise<z.infer<typeof administrativeDivisionResponseSchema>[]> {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const divisions = await this.addressBookService.getAdministrativeDivisionsByParentId(input.parentId);
      return divisions;
    } catch (error) {
      throw this.responseHandler.createTRPCError(
        ModuleCode.ADDRESS_BOOK,
        OperationCode.READ,  // OperationCode.READ
        ErrorLevelCode.SERVER_ERROR, // ErrorLevelCode.SERVER_ERROR
        error.message || 'Failed to retrieve administrative divisions by parent ID'
      );
    }
  }
}
