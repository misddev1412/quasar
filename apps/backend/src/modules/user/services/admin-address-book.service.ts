import { Injectable, Inject } from '@nestjs/common';
import { AddressBookRepository } from '../repositories/address-book.repository';
import { AddressBook, AddressType } from '../entities/address-book.entity';

@Injectable()
export class AdminAddressBookService {
  constructor(
    @Inject(AddressBookRepository)
    private readonly addressBookRepository: AddressBookRepository,
  ) {}

  async createAddressBook(data: Partial<AddressBook>): Promise<AddressBook> {
    // If this is set as default, ensure it's the only default for this user and type
    if (data.isDefault && data.userId) {
      await this.addressBookRepository.updateBy(
        { userId: data.userId },
        { isDefault: false },
      );
    }

    return this.addressBookRepository.create(data);
  }

  async getAddressBookById(id: string): Promise<AddressBook | null> {
    return this.addressBookRepository.findById(id);
  }

  async getAddressBooksByUserId(userId: string): Promise<AddressBook[]> {
    return this.addressBookRepository.findByUserId(userId);
  }

  async getAddressBooksByUserIdAndType(
    userId: string,
    addressType: AddressType,
  ): Promise<AddressBook[]> {
    return this.addressBookRepository.findByUserIdAndType(userId, addressType);
  }

  async getDefaultAddressBook(userId: string): Promise<AddressBook | null> {
    return this.addressBookRepository.findDefaultByUserId(userId);
  }

  async updateAddressBook(id: string, data: Partial<AddressBook>): Promise<AddressBook | null> {
    const addressBook = await this.addressBookRepository.findById(id);
    if (!addressBook) {
      throw new Error('Address book entry not found');
    }

    // If updating to set as default, ensure it's the only default for this user
    if (data.isDefault && addressBook.userId) {
      await this.addressBookRepository.updateBy(
        { userId: addressBook.userId },
        { isDefault: false },
      );
    }

    return this.addressBookRepository.update(id, data);
  }

  async deleteAddressBook(id: string): Promise<boolean> {
    const addressBook = await this.addressBookRepository.findById(id);
    if (!addressBook) {
      throw new Error('Address book entry not found');
    }

    return this.addressBookRepository.delete(id);
  }

  async setAsDefault(id: string): Promise<void> {
    const addressBook = await this.addressBookRepository.findById(id);
    if (!addressBook) {
      throw new Error('Address book entry not found');
    }

    await this.addressBookRepository.setAsDefault(id, addressBook.userId);
  }

  async getAllAddressBooks(
    page: number = 1,
    limit: number = 10,
    userId?: string,
    countryId?: string,
    addressType?: AddressType,
  ) {
    const where: Parameters<typeof this.addressBookRepository.findAll>[2] = {};

    if (userId) {
      where.userId = userId;
    }

    if (countryId) {
      where.countryId = countryId;
    }

    if (addressType) {
      where.addressType = addressType;
    }

    return this.addressBookRepository.findAll(page, limit, where);
  }

  async getAddressBookStats(userId?: string) {
    const totalCount = await this.addressBookRepository.count(
      userId ? { userId } : undefined
    );

    const billingCount = await this.addressBookRepository.count({
      ...(userId && { userId }),
      addressType: AddressType.BILLING,
    });

    const shippingCount = await this.addressBookRepository.count({
      ...(userId && { userId }),
      addressType: AddressType.SHIPPING,
    });

    const bothCount = await this.addressBookRepository.count({
      ...(userId && { userId }),
      addressType: AddressType.BOTH,
    });

    return {
      total: totalCount,
      billing: billingCount,
      shipping: shippingCount,
      both: bothCount,
    };
  }

  async validateAddressBook(data: Partial<AddressBook>): Promise<boolean> {
    // Check if user exists (this would require user service)
    if (!data.userId) {
      throw new Error('User ID is required');
    }

    // Check if country exists (this would require country service)
    if (!data.countryId) {
      throw new Error('Country ID is required');
    }

    // Validate required fields
    if (!data.firstName || !data.lastName || !data.addressLine1) {
      throw new Error('First name, last name, and address line 1 are required');
    }

    return true;
  }
}