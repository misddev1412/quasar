import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { Customer } from './customer.entity';
import { Country } from './country.entity';
import { AdministrativeDivision } from './administrative-division.entity';

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
  @ManyToOne(() => Customer, (customer) => customer.addressBook)
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @ManyToOne(() => Country, { lazy: true })
  @JoinColumn({ name: 'country_id' })
  country: Promise<Country>;

  @ManyToOne(() => AdministrativeDivision, { lazy: true })
  @JoinColumn({ name: 'province_id' })
  province: Promise<AdministrativeDivision>;

  @ManyToOne(() => AdministrativeDivision, { lazy: true })
  @JoinColumn({ name: 'ward_id' })
  ward: Promise<AdministrativeDivision>;

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