import { Injectable, Inject } from '@nestjs/common';
import { AddressBookRepository } from '../repositories/address-book.repository';
import { AddressBookConfigRepository } from '../repositories/address-book-config.repository';
import { AddressBook, AddressType } from '../entities/address-book.entity';
import { CountryRepository } from '../../products/repositories/country.repository';
import { AdministrativeDivisionRepository } from '../../products/repositories/administrative-division.repository';
import { AddressConfigType } from '../entities/address-book-config.entity';

@Injectable()
export class ClientAddressBookService {
  constructor(
    @Inject(AddressBookRepository)
    private readonly addressBookRepository: AddressBookRepository,
    @Inject(AddressBookConfigRepository)
    private readonly addressBookConfigRepository: AddressBookConfigRepository,
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

    // Get country-specific configuration
    const requirePostalCode = await this.addressBookConfigRepository.getCountryConfigValue(
      data.countryId,
      AddressConfigType.REQUIRE_POSTAL_CODE,
      false,
    );

    const requirePhone = await this.addressBookConfigRepository.getCountryConfigValue(
      data.countryId,
      AddressConfigType.REQUIRE_PHONE,
      false,
    );

    const requireCompany = await this.addressBookConfigRepository.getCountryConfigValue(
      data.countryId,
      AddressConfigType.REQUIRE_COMPANY,
      false,
    );

    const requireAdministrativeDivisions = await this.addressBookConfigRepository.getCountryConfigValue(
      data.countryId,
      AddressConfigType.REQUIRE_ADMINISTRATIVE_DIVISIONS,
      true,
    );

    const maxAddressBookEntries = await this.addressBookConfigRepository.getCountryConfigValue(
      data.countryId,
      AddressConfigType.MAX_ADDRESS_BOOK_ENTRIES,
      10,
    );

    // Validate against country-specific requirements
    if (requirePostalCode && !data.postalCode) {
      throw new Error('Postal code is required for this country');
    }

    if (requirePhone && !data.phoneNumber) {
      throw new Error('Phone number is required for this country');
    }

    if (requireCompany && !data.companyName) {
      throw new Error('Company name is required for this country');
    }

    // Validate province if required or provided
    if (requireAdministrativeDivisions && !data.provinceId) {
      throw new Error('Province is required for this country');
    }

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

    // Check address book limit
    const currentAddressCount = await this.addressBookRepository.countByCustomerId(customerId);
    if (currentAddressCount >= maxAddressBookEntries) {
      throw new Error(`Maximum ${maxAddressBookEntries} address book entries allowed per customer`);
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

    const countryId = data.countryId || existingAddress.countryId;

    // Validate country if changed
    if (data.countryId && data.countryId !== existingAddress.countryId) {
      const country = await this.countryRepository.findById(data.countryId);
      if (!country) {
        throw new Error('Invalid country');
      }
    }

    // Get country-specific configuration
    const requirePostalCode = await this.addressBookConfigRepository.getCountryConfigValue(
      countryId,
      AddressConfigType.REQUIRE_POSTAL_CODE,
      false,
    );

    const requirePhone = await this.addressBookConfigRepository.getCountryConfigValue(
      countryId,
      AddressConfigType.REQUIRE_PHONE,
      false,
    );

    const requireCompany = await this.addressBookConfigRepository.getCountryConfigValue(
      countryId,
      AddressConfigType.REQUIRE_COMPANY,
      false,
    );

    const requireAdministrativeDivisions = await this.addressBookConfigRepository.getCountryConfigValue(
      countryId,
      AddressConfigType.REQUIRE_ADMINISTRATIVE_DIVISIONS,
      true,
    );

    // Validate against country-specific requirements when fields are being updated
    if (requirePostalCode && data.postalCode === '') {
      throw new Error('Postal code is required for this country');
    }

    if (requirePhone && data.phoneNumber === '') {
      throw new Error('Phone number is required for this country');
    }

    if (requireCompany && data.companyName === '') {
      throw new Error('Company name is required for this country');
    }

    // Validate province if required or provided
    if (requireAdministrativeDivisions && data.provinceId === '' && countryId === existingAddress.countryId) {
      throw new Error('Province is required for this country');
    }

    if (data.provinceId && data.provinceId !== existingAddress.provinceId) {
      const province = await this.administrativeDivisionRepository.findById(data.provinceId);
      if (!province || province.countryId !== countryId) {
        throw new Error('Invalid province');
      }
    }

    // Validate ward if changed
    if (data.wardId && data.wardId !== existingAddress.wardId) {
      const ward = await this.administrativeDivisionRepository.findById(data.wardId);
      if (!ward || ward.countryId !== countryId) {
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
    const countries = await this.countryRepository.findAll();
    return countries.map(country => ({
      id: String(country.id),
      name: String(country.name),
      code: String(country.code),
      iso2: country.iso2 ? String(country.iso2) : null,
      iso3: country.iso3 ? String(country.iso3) : null,
      phoneCode: country.phoneCode ? String(country.phoneCode) : null,
      latitude: country.latitude ? Number(country.latitude) : null,
      longitude: country.longitude ? Number(country.longitude) : null,
    }));
  }

  async getAdministrativeDivisions(countryId: string, type?: string): Promise<any[]> {
    const where: any = { countryId };
    if (type) {
      where.type = type;
    }
    const divisions = await this.administrativeDivisionRepository.findAllBy(where);
    return divisions.map(division => ({
      id: String(division.id),
      countryId: String(division.countryId),
      parentId: division.parentId ? String(division.parentId) : null,
      name: String(division.name),
      code: division.code ? String(division.code) : null,
      type: division.type,
      i18nKey: String(division.i18nKey),
      latitude: division.latitude ? Number(division.latitude) : null,
      longitude: division.longitude ? Number(division.longitude) : null,
    }));
  }

  async getAdministrativeDivisionsByParentId(parentId: string): Promise<any[]> {
    const divisions = await this.administrativeDivisionRepository.findByParentId(parentId);
    return divisions.map(division => ({
      id: String(division.id),
      countryId: String(division.countryId),
      parentId: division.parentId ? String(division.parentId) : null,
      name: String(division.name),
      code: division.code ? String(division.code) : null,
      type: division.type,
      i18nKey: String(division.i18nKey),
      latitude: division.latitude ? Number(division.latitude) : null,
      longitude: division.longitude ? Number(division.longitude) : null,
    }));
  }

  async getCountryAddressConfig(countryId: string): Promise<any> {
    const configs = await this.addressBookConfigRepository.findByCountryId(countryId);

    const configMap: any = {};

    configs.forEach(config => {
      switch (config.configKey) {
        case AddressConfigType.REQUIRE_POSTAL_CODE:
        case AddressConfigType.REQUIRE_PHONE:
        case AddressConfigType.REQUIRE_COMPANY:
        case AddressConfigType.ALLOW_ADDRESS_LINE_2:
        case AddressConfigType.REQUIRE_DELIVERY_INSTRUCTIONS:
        case AddressConfigType.REQUIRE_ADMINISTRATIVE_DIVISIONS:
          configMap[config.configKey] = config.getBooleanValue();
          break;
        case AddressConfigType.MAX_ADDRESS_BOOK_ENTRIES:
          configMap[config.configKey] = config.getNumberValue();
          break;
        case AddressConfigType.DEFAULT_ADDRESS_TYPE:
          configMap[config.configKey] = config.getAddressTypeValue();
          break;
        default:
          configMap[config.configKey] = config.configValue;
      }
    });

    // Fill in default values for missing configs
    return {
      requirePostalCode: configMap[AddressConfigType.REQUIRE_POSTAL_CODE] ?? false,
      requirePhone: configMap[AddressConfigType.REQUIRE_PHONE] ?? false,
      requireCompany: configMap[AddressConfigType.REQUIRE_COMPANY] ?? false,
      allowAddressLine2: configMap[AddressConfigType.ALLOW_ADDRESS_LINE_2] ?? true,
      requireDeliveryInstructions: configMap[AddressConfigType.REQUIRE_DELIVERY_INSTRUCTIONS] ?? false,
      maxAddressBookEntries: configMap[AddressConfigType.MAX_ADDRESS_BOOK_ENTRIES] ?? 10,
      defaultAddressType: configMap[AddressConfigType.DEFAULT_ADDRESS_TYPE] ?? AddressType.BOTH,
      requireAdministrativeDivisions: configMap[AddressConfigType.REQUIRE_ADMINISTRATIVE_DIVISIONS] ?? true,
    };
  }

  async getCustomerAddressBookLimit(customerId: string): Promise<number> {
    // Get the customer's addresses to determine their country
    const addresses = await this.addressBookRepository.findByCustomerId(customerId);
    if (addresses.length === 0) {
      return 10; // Default limit
    }

    // Use the country from the first address
    const countryId = addresses[0].countryId;

    return this.addressBookConfigRepository.getCountryConfigValue(
      countryId,
      AddressConfigType.MAX_ADDRESS_BOOK_ENTRIES,
      10,
    );
  }

  async validateAddressAgainstCountryConfig(addressData: Partial<AddressBook>): Promise<string[]> {
    if (!addressData.countryId) {
      return ['Country ID is required'];
    }

    const errors: string[] = [];

    // Get country-specific configuration
    const requirePostalCode = await this.addressBookConfigRepository.getCountryConfigValue(
      addressData.countryId,
      AddressConfigType.REQUIRE_POSTAL_CODE,
      false,
    );

    const requirePhone = await this.addressBookConfigRepository.getCountryConfigValue(
      addressData.countryId,
      AddressConfigType.REQUIRE_PHONE,
      false,
    );

    const requireCompany = await this.addressBookConfigRepository.getCountryConfigValue(
      addressData.countryId,
      AddressConfigType.REQUIRE_COMPANY,
      false,
    );

    const requireAdministrativeDivisions = await this.addressBookConfigRepository.getCountryConfigValue(
      addressData.countryId,
      AddressConfigType.REQUIRE_ADMINISTRATIVE_DIVISIONS,
      true,
    );

    // Validate against country-specific requirements
    if (requirePostalCode && !addressData.postalCode) {
      errors.push('Postal code is required for this country');
    }

    if (requirePhone && !addressData.phoneNumber) {
      errors.push('Phone number is required for this country');
    }

    if (requireCompany && !addressData.companyName) {
      errors.push('Company name is required for this country');
    }

    if (requireAdministrativeDivisions && !addressData.provinceId) {
      errors.push('Province is required for this country');
    }

    return errors;
  }
}