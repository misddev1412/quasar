import { Injectable, Inject } from '@nestjs/common';
import { AddressBookRepository } from '../repositories/address-book.repository';
import { AddressBook, AddressType } from '../entities/address-book.entity';
import { CountryRepository } from '../repositories/country.repository';
import { AdministrativeDivisionRepository } from '../repositories/administrative-division.repository';

@Injectable()
export class ClientAddressBookService {
  constructor(
    @Inject(AddressBookRepository)
    private readonly addressBookRepository: AddressBookRepository,
    @Inject(CountryRepository)
    private readonly countryRepository: CountryRepository,
    @Inject(AdministrativeDivisionRepository)
    private readonly administrativeDivisionRepository: AdministrativeDivisionRepository,
  ) {}

  async getAddressBooksByCustomerId(customerId: string): Promise<AddressBook[]> {
    return this.addressBookRepository.findByCustomerId(customerId);
  }

  async getAddressBookById(id: string, customerId: string): Promise<AddressBook | null> {
    const address = await this.addressBookRepository.findById(id);

    // Ensure the address belongs to the requesting customer
    if (!address || address.customerId !== customerId) {
      return null;
    }

    return address;
  }

  async createAddressBook(customerId: string, data: Partial<AddressBook>): Promise<AddressBook> {
    // Validate required fields
    if (!data.firstName || !data.lastName || !data.addressLine1 || !data.countryId) {
      throw new Error('First name, last name, address line 1, and country are required');
    }

    // Validate country exists
    const country = await this.countryRepository.findById(data.countryId);
    if (!country) {
      throw new Error('Invalid country');
    }

    // Validate province if provided
    if (data.provinceId) {
      const province = await this.administrativeDivisionRepository.findById(data.provinceId);
      if (!province || province.countryId !== data.countryId) {
        throw new Error('Invalid province');
      }
    }

    // Validate ward if provided
    if (data.wardId) {
      const ward = await this.administrativeDivisionRepository.findById(data.wardId);
      if (!ward || ward.countryId !== data.countryId) {
        throw new Error('Invalid ward');
      }
    }

    // Set customer ID
    const addressData = {
      ...data,
      customerId,
      addressType: data.addressType || AddressType.BOTH,
    };

    // If this is set as default, ensure it's the only default for this customer
    if (data.isDefault && customerId) {
      await this.addressBookRepository.updateBy(
        { customerId },
        { isDefault: false },
      );
    }

    return this.addressBookRepository.create(addressData);
  }

  async updateAddressBook(id: string, customerId: string, data: Partial<AddressBook>): Promise<AddressBook | null> {
    const existingAddress = await this.addressBookRepository.findById(id);

    // Ensure the address belongs to the requesting customer
    if (!existingAddress || existingAddress.customerId !== customerId) {
      throw new Error('Address not found or access denied');
    }

    // Validate country if changed
    if (data.countryId && data.countryId !== existingAddress.countryId) {
      const country = await this.countryRepository.findById(data.countryId);
      if (!country) {
        throw new Error('Invalid country');
      }
    }

    // Validate province if changed
    if (data.provinceId && data.provinceId !== existingAddress.provinceId) {
      const province = await this.administrativeDivisionRepository.findById(data.provinceId);
      if (!province || province.countryId !== (data.countryId || existingAddress.countryId)) {
        throw new Error('Invalid province');
      }
    }

    // Validate ward if changed
    if (data.wardId && data.wardId !== existingAddress.wardId) {
      const ward = await this.administrativeDivisionRepository.findById(data.wardId);
      if (!ward || ward.countryId !== (data.countryId || existingAddress.countryId)) {
        throw new Error('Invalid ward');
      }
    }

    // If updating to set as default, ensure it's the only default for this customer
    if (data.isDefault && existingAddress.customerId) {
      await this.addressBookRepository.updateBy(
        { customerId: existingAddress.customerId },
        { isDefault: false },
      );
    }

    return this.addressBookRepository.update(id, data);
  }

  async deleteAddressBook(id: string, customerId: string): Promise<boolean> {
    const address = await this.addressBookRepository.findById(id);

    // Ensure the address belongs to the requesting customer
    if (!address || address.customerId !== customerId) {
      throw new Error('Address not found or access denied');
    }

    return this.addressBookRepository.delete(id);
  }

  async setAsDefault(id: string, customerId: string): Promise<void> {
    const address = await this.addressBookRepository.findById(id);

    // Ensure the address belongs to the requesting customer
    if (!address || address.customerId !== customerId) {
      throw new Error('Address not found or access denied');
    }

    await this.addressBookRepository.setAsDefault(id, customerId);
  }

  async getDefaultAddressBook(customerId: string): Promise<AddressBook | null> {
    return this.addressBookRepository.findDefaultByCustomerId(customerId);
  }

  async getCountries(): Promise<any[]> {
    return this.countryRepository.findAll();
  }

  async getAdministrativeDivisions(countryId: string, type?: string): Promise<any[]> {
    const where: any = { countryId };
    if (type) {
      where.type = type;
    }
    return this.administrativeDivisionRepository.findAllBy(where);
  }
}