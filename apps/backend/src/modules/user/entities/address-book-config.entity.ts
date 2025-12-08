import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '@shared';
import { Expose } from 'class-transformer';
import { Country } from '../../products/entities/country.entity';
import { AddressType } from './address-book.entity';

export enum AddressConfigType {
  REQUIRE_POSTAL_CODE = 'REQUIRE_POSTAL_CODE',
  REQUIRE_PHONE = 'REQUIRE_PHONE',
  REQUIRE_COMPANY = 'REQUIRE_COMPANY',
  ALLOW_ADDRESS_LINE_2 = 'ALLOW_ADDRESS_LINE_2',
  REQUIRE_DELIVERY_INSTRUCTIONS = 'REQUIRE_DELIVERY_INSTRUCTIONS',
  MAX_ADDRESS_BOOK_ENTRIES = 'MAX_ADDRESS_BOOK_ENTRIES',
  DEFAULT_ADDRESS_TYPE = 'DEFAULT_ADDRESS_TYPE',
  REQUIRE_ADMINISTRATIVE_DIVISIONS = 'REQUIRE_ADMINISTRATIVE_DIVISIONS',
}

export enum BooleanConfigValue {
  TRUE = 'TRUE',
  FALSE = 'FALSE',
}

@Entity('address_book_config')
export class AddressBookConfig extends BaseEntity {
  @Expose()
  @Column({
    name: 'country_id',
    type: 'varchar',
    unique: true,
  })
  countryId: string;

  @Expose()
  @Column({
    name: 'config_key',
    type: 'enum',
    enum: AddressConfigType,
  })
  configKey: AddressConfigType;

  @Expose()
  @Column({
    name: 'config_value',
    type: 'text',
  })
  configValue: string;

  @Expose()
  @Column({
    name: 'description',
    type: 'text',
    nullable: true,
  })
  description?: string;

  @Expose()
  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  // Relations
  @ManyToOne(() => Country, { lazy: true })
  @JoinColumn({ name: 'country_id' })
  country: Promise<Country>;

  // Helper methods for type-safe config access
  getBooleanValue(): boolean {
    return this.configValue === BooleanConfigValue.TRUE;
  }

  getNumberValue(): number {
    return parseInt(this.configValue, 10) || 0;
  }

  getAddressTypeValue(): AddressType {
    return this.configValue as AddressType;
  }

  // Static helper methods for common config patterns
  static createBooleanConfig(
    countryId: string,
    configKey: AddressConfigType,
    value: boolean,
    description?: string,
  ): AddressBookConfig {
    const config = new AddressBookConfig();
    config.countryId = countryId;
    config.configKey = configKey;
    config.configValue = value ? BooleanConfigValue.TRUE : BooleanConfigValue.FALSE;
    config.description = description;
    return config;
  }

  static createNumberConfig(
    countryId: string,
    configKey: AddressConfigType,
    value: number,
    description?: string,
  ): AddressBookConfig {
    const config = new AddressBookConfig();
    config.countryId = countryId;
    config.configKey = configKey;
    config.configValue = value.toString();
    config.description = description;
    return config;
  }

  static createAddressTypeConfig(
    countryId: string,
    configKey: AddressConfigType,
    value: AddressType,
    description?: string,
  ): AddressBookConfig {
    const config = new AddressBookConfig();
    config.countryId = countryId;
    config.configKey = configKey;
    config.configValue = value;
    config.description = description;
    return config;
  }
}