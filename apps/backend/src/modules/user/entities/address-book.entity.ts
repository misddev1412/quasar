import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { Country } from '../../products/entities/country.entity';
import { AdministrativeDivision } from '../../products/entities/administrative-division.entity';
import { AddressBookConfig, AddressConfigType } from './address-book-config.entity';

export enum AddressType {
  BILLING = 'BILLING',
  SHIPPING = 'SHIPPING',
  BOTH = 'BOTH',
}

@Entity('address_book')
export class AddressBook extends BaseEntity {
  @Expose()
  @Column({
    name: 'customer_id',
    type: 'uuid',
  })
  customerId: string;

  @Expose()
  @Column({
    name: 'country_id',
    type: 'varchar',
  })
  countryId: string;

  @Expose()
  @Column({
    name: 'province_id',
    type: 'varchar',
    nullable: true,
  })
  provinceId?: string;

  @Expose()
  @Column({
    name: 'ward_id',
    type: 'varchar',
    nullable: true,
  })
  wardId?: string;

  @Expose()
  @Column({
    name: 'first_name',
    type: 'varchar',
    length: 100,
  })
  firstName: string;

  @Expose()
  @Column({
    name: 'last_name',
    type: 'varchar',
    length: 100,
  })
  lastName: string;

  @Expose()
  @Column({
    name: 'company_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  companyName?: string;

  @Expose()
  @Column({
    name: 'address_line_1',
    type: 'text',
  })
  addressLine1: string;

  @Expose()
  @Column({
    name: 'address_line_2',
    type: 'text',
    nullable: true,
  })
  addressLine2?: string;

  @Expose()
  @Column({
    name: 'postal_code',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  postalCode?: string;

  @Expose()
  @Column({
    name: 'phone_number',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  phoneNumber?: string;

  @Expose()
  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  email?: string;

  @Expose()
  @Column({
    name: 'address_type',
    type: 'enum',
    enum: AddressType,
    default: AddressType.BOTH,
  })
  addressType: AddressType;

  @Expose()
  @Column({
    name: 'is_default',
    type: 'boolean',
    default: false,
  })
  isDefault: boolean;

  @Expose()
  @Column({
    name: 'label',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  label?: string;

  @Expose()
  @Column({
    name: 'delivery_instructions',
    type: 'text',
    nullable: true,
  })
  deliveryInstructions?: string;

  // Relations
  @ManyToOne('Customer', 'addressBook')
  @JoinColumn({ name: 'customer_id' })
  customer: any;

  @ManyToOne(() => Country, { lazy: true })
  @JoinColumn({ name: 'country_id' })
  country: Promise<Country>;

  @ManyToOne(() => AdministrativeDivision, { lazy: true })
  @JoinColumn({ name: 'province_id' })
  province: Promise<AdministrativeDivision>;

  @ManyToOne(() => AdministrativeDivision, { lazy: true })
  @JoinColumn({ name: 'ward_id' })
  ward: Promise<AdministrativeDivision>;

  @ManyToOne(() => AddressBookConfig, { lazy: true })
  @JoinColumn({ name: 'config_id' })
  config: Promise<AddressBookConfig>;

  @Expose()
  @Column({
    name: 'config_id',
    type: 'uuid',
    nullable: true,
  })
  configId?: string;

  // Virtual properties
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  get formattedAddress(): string {
    const parts = [
      this.addressLine1,
      this.addressLine2,
      this.postalCode,
    ].filter(Boolean);

    return parts.join(', ');
  }

  get displayLabel(): string {
    return this.label || `${this.addressType.toLowerCase()} address`;
  }

  get isShippingAddress(): boolean {
    return this.addressType === AddressType.SHIPPING || this.addressType === AddressType.BOTH;
  }

  get isBillingAddress(): boolean {
    return this.addressType === AddressType.BILLING || this.addressType === AddressType.BOTH;
  }

  async getConfig(): Promise<AddressBookConfig | null> {
    return this.config ? await this.config : null;
  }

  async isPostalCodeRequired(): Promise<boolean> {
    const config = await this.getConfig();
    if (!config || config.configKey !== AddressConfigType.REQUIRE_POSTAL_CODE) {
      return false;
    }
    return config.getBooleanValue();
  }

  async isPhoneRequired(): Promise<boolean> {
    const config = await this.getConfig();
    if (!config || config.configKey !== AddressConfigType.REQUIRE_PHONE) {
      return false;
    }
    return config.getBooleanValue();
  }

  async isCompanyRequired(): Promise<boolean> {
    const config = await this.getConfig();
    if (!config || config.configKey !== AddressConfigType.REQUIRE_COMPANY) {
      return false;
    }
    return config.getBooleanValue();
  }

  async getMaxAddressBookEntries(): Promise<number> {
    const config = await this.getConfig();
    if (!config || config.configKey !== AddressConfigType.MAX_ADDRESS_BOOK_ENTRIES) {
      return 10; // Default value
    }
    return config.getNumberValue();
  }

  async validateAgainstConfig(): Promise<string[]> {
    const errors: string[] = [];
    const config = await this.getConfig();

    if (!config) {
      return errors;
    }

    if (config.configKey === AddressConfigType.REQUIRE_POSTAL_CODE && config.getBooleanValue() && !this.postalCode) {
      errors.push('Postal code is required for this country');
    }

    if (config.configKey === AddressConfigType.REQUIRE_PHONE && config.getBooleanValue() && !this.phoneNumber) {
      errors.push('Phone number is required for this country');
    }

    if (config.configKey === AddressConfigType.REQUIRE_COMPANY && config.getBooleanValue() && !this.companyName) {
      errors.push('Company name is required for this country');
    }

    return errors;
  }

  async getFullAddress(): Promise<string> {
    const country = await this.country;
    const province = this.province ? await this.province : null;
    const ward = this.ward ? await this.ward : null;

    const parts = [
      this.formattedAddress,
      ward?.name,
      province?.name,
      country.name,
    ].filter(Boolean);

    return parts.join(', ');
  }
}