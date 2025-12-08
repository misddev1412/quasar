import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { AddressBookConfig, AddressConfigType } from '../entities/address-book-config.entity';
import { AddressType } from '../entities/address-book.entity';

@Injectable()
export class AddressBookConfigRepository {
  constructor(
    @InjectRepository(AddressBookConfig)
    private readonly repository: Repository<AddressBookConfig>,
  ) {}

  async create(configData: Partial<AddressBookConfig>): Promise<AddressBookConfig> {
    const config = this.repository.create(configData);
    return this.repository.save(config);
  }

  async findById(id: string): Promise<AddressBookConfig | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['country'],
    });
  }

  async findByCountryId(countryId: string): Promise<AddressBookConfig[]> {
    return this.repository.find({
      where: { countryId, isActive: true },
      relations: ['country'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByCountryIdAndKey(
    countryId: string,
    configKey: AddressConfigType,
  ): Promise<AddressBookConfig | null> {
    return this.repository.findOne({
      where: { countryId, configKey, isActive: true },
      relations: ['country'],
    });
  }

  async update(id: string, updateData: Partial<AddressBookConfig>): Promise<AddressBookConfig | null> {
    await this.repository.update(id, updateData);
    return this.findById(id);
  }

  async updateBy(
    criteria: FindOptionsWhere<AddressBookConfig>,
    updateData: Partial<AddressBookConfig>,
  ): Promise<void> {
    await this.repository.update(criteria, updateData);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return result.affected > 0;
  }

  async deactivate(id: string): Promise<void> {
    await this.repository.update(id, { isActive: false });
  }

  async activate(id: string): Promise<void> {
    await this.repository.update(id, { isActive: true });
  }

  async findByConfigKey(configKey: AddressConfigType): Promise<AddressBookConfig[]> {
    return this.repository.find({
      where: { configKey, isActive: true },
      relations: ['country'],
      order: { countryId: 'ASC' },
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    where?: FindOptionsWhere<AddressBookConfig>,
  ): Promise<{ data: AddressBookConfig[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.repository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['country'],
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async count(where?: FindOptionsWhere<AddressBookConfig>): Promise<number> {
    return this.repository.count({ where });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }

  async existsByCountryIdAndKey(countryId: string, configKey: AddressConfigType): Promise<boolean> {
    const count = await this.repository.count({
      where: { countryId, configKey, isActive: true },
    });
    return count > 0;
  }

  async createDefaultConfigsForCountry(countryId: string): Promise<AddressBookConfig[]> {
    const configs = [
      AddressBookConfig.createBooleanConfig(
        countryId,
        AddressConfigType.REQUIRE_POSTAL_CODE,
        false,
        'Whether postal code is required for addresses in this country',
      ),
      AddressBookConfig.createBooleanConfig(
        countryId,
        AddressConfigType.REQUIRE_PHONE,
        false,
        'Whether phone number is required for addresses in this country',
      ),
      AddressBookConfig.createBooleanConfig(
        countryId,
        AddressConfigType.REQUIRE_COMPANY,
        false,
        'Whether company name is required for addresses in this country',
      ),
      AddressBookConfig.createBooleanConfig(
        countryId,
        AddressConfigType.ALLOW_ADDRESS_LINE_2,
        true,
        'Whether address line 2 is allowed for addresses in this country',
      ),
      AddressBookConfig.createBooleanConfig(
        countryId,
        AddressConfigType.REQUIRE_DELIVERY_INSTRUCTIONS,
        false,
        'Whether delivery instructions are required for addresses in this country',
      ),
      AddressBookConfig.createNumberConfig(
        countryId,
        AddressConfigType.MAX_ADDRESS_BOOK_ENTRIES,
        10,
        'Maximum number of address book entries allowed per customer in this country',
      ),
      AddressBookConfig.createAddressTypeConfig(
        countryId,
        AddressConfigType.DEFAULT_ADDRESS_TYPE,
        AddressType.BOTH,
        'Default address type for new addresses in this country',
      ),
      AddressBookConfig.createBooleanConfig(
        countryId,
        AddressConfigType.REQUIRE_ADMINISTRATIVE_DIVISIONS,
        true,
        'Whether administrative divisions (province/ward) are required for addresses in this country',
      ),
    ];

    return Promise.all(configs.map(config => this.create(config)));
  }

  async getCountryConfigValue<T extends boolean | number | string>(
    countryId: string,
    configKey: AddressConfigType,
    defaultValue: T,
  ): Promise<T> {
    const config = await this.findByCountryIdAndKey(countryId, configKey);
    if (!config) {
      return defaultValue;
    }

    if (typeof defaultValue === 'boolean') {
      return config.getBooleanValue() as T;
    } else if (typeof defaultValue === 'number') {
      return config.getNumberValue() as T;
    } else {
      return config.configValue as T;
    }
  }
}