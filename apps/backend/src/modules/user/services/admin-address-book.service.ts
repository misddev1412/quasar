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
    // If this is set as default, ensure it's the only default for this customer and type
    if (data.isDefault && data.customerId) {
      await this.addressBookRepository.updateBy(
        { customerId: data.customerId },
        { isDefault: false },
      );
    }

    return this.addressBookRepository.create(data);
  }

  async getAddressBookById(id: string): Promise<AddressBook | null> {
    return this.addressBookRepository.findById(id);
  }

  async getAddressBooksByCustomerId(customerId: string): Promise<AddressBook[]> {
    return this.addressBookRepository.findByCustomerId(customerId);
  }

  async getAddressBooksByCustomerIdAndType(
    customerId: string,
    addressType: AddressType,
  ): Promise<AddressBook[]> {
    return this.addressBookRepository.findByCustomerIdAndType(customerId, addressType);
  }

  async getDefaultAddressBook(customerId: string): Promise<AddressBook | null> {
    return this.addressBookRepository.findDefaultByCustomerId(customerId);
  }

  async updateAddressBook(id: string, data: Partial<AddressBook>): Promise<AddressBook | null> {
    const addressBook = await this.addressBookRepository.findById(id);
    if (!addressBook) {
      throw new Error('Address book entry not found');
    }

    // If updating to set as default, ensure it's the only default for this customer
    if (data.isDefault && addressBook.customerId) {
      await this.addressBookRepository.updateBy(
        { customerId: addressBook.customerId },
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

    await this.addressBookRepository.setAsDefault(id, addressBook.customerId);
  }

  async getAllAddressBooks(
    page: number = 1,
    limit: number = 10,
    customerId?: string,
    countryId?: string,
    addressType?: AddressType,
  ) {
    const where: Parameters<typeof this.addressBookRepository.findAll>[2] = {};

    if (customerId) {
      where.customerId = customerId;
    }

    if (countryId) {
      where.countryId = countryId;
    }

    if (addressType) {
      where.addressType = addressType;
    }

    return this.addressBookRepository.findAll(page, limit, where);
  }

  async getAddressBookStats(customerId?: string) {
    const totalCount = await this.addressBookRepository.count(
      customerId ? { customerId } : undefined
    );

    const billingCount = await this.addressBookRepository.count({
      ...(customerId && { customerId }),
      addressType: AddressType.BILLING,
    });

    const shippingCount = await this.addressBookRepository.count({
      ...(customerId && { customerId }),
      addressType: AddressType.SHIPPING,
    });

    const bothCount = await this.addressBookRepository.count({
      ...(customerId && { customerId }),
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
    // Check if customer exists (this would require customer service)
    if (!data.customerId) {
      throw new Error('Customer ID is required');
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