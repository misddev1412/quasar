import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { AddressBook, AddressType } from '../entities/address-book.entity';

@Injectable()
export class AddressBookRepository {
  constructor(
    @InjectRepository(AddressBook)
    private readonly repository: Repository<AddressBook>,
  ) {}

  async create(addressBookData: Partial<AddressBook>): Promise<AddressBook> {
    const addressBook = this.repository.create(addressBookData);
    return this.repository.save(addressBook);
  }

  async findById(id: string): Promise<AddressBook | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['customer'],
    });
  }

  async findByCustomerId(customerId: string): Promise<AddressBook[]> {
    return this.repository.find({
      where: { customerId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async findByCustomerIdAndType(
    customerId: string,
    addressType: AddressType,
  ): Promise<AddressBook[]> {
    return this.repository.find({
      where: [
        { customerId, addressType },
        { customerId, addressType: AddressType.BOTH },
      ],
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async findDefaultByCustomerId(customerId: string): Promise<AddressBook | null> {
    return this.repository.findOne({
      where: { customerId, isDefault: true },
    });
  }

  async findDefaultByCustomerIdAndType(
    customerId: string,
    addressType: AddressType,
  ): Promise<AddressBook | null> {
    return this.repository.findOne({
      where: [
        { customerId, addressType, isDefault: true },
        { customerId, addressType: AddressType.BOTH, isDefault: true },
      ],
    });
  }

  async update(id: string, updateData: Partial<AddressBook>): Promise<AddressBook | null> {
    await this.repository.update(id, updateData);
    return this.findById(id);
  }

  async updateBy(criteria: FindOptionsWhere<AddressBook>, updateData: Partial<AddressBook>): Promise<void> {
    await this.repository.update(criteria, updateData);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return result.affected > 0;
  }

  async setAsDefault(id: string, customerId: string): Promise<void> {
    // First, unset all default addresses for this customer
    await this.repository.update(
      { customerId },
      { isDefault: false },
    );

    // Then set the specified address as default
    await this.repository.update(id, { isDefault: true });
  }

  async findByCountryId(countryId: string): Promise<AddressBook[]> {
    return this.repository.find({
      where: { countryId },
    });
  }

  async findByProvinceId(provinceId: string): Promise<AddressBook[]> {
    return this.repository.find({
      where: { provinceId },
    });
  }

  async findByWardId(wardId: string): Promise<AddressBook[]> {
    return this.repository.find({
      where: { wardId },
    });
  }

  async count(where?: FindOptionsWhere<AddressBook>): Promise<number> {
    return this.repository.count({ where });
  }

  async countByCustomerId(customerId: string): Promise<number> {
    return this.repository.count({
      where: { customerId },
    });
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    where?: FindOptionsWhere<AddressBook>,
  ): Promise<{ data: AddressBook[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.repository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['customer'],
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }

  async validateUniqueDefault(
    customerId: string,
    addressType: AddressType,
    excludeId?: string,
  ): Promise<boolean> {
    const where: FindOptionsWhere<AddressBook> = {
      customerId,
      isDefault: true,
    };

    if (addressType !== AddressType.BOTH) {
      where.addressType = addressType;
    }

    if (excludeId) {
      where.id = excludeId;
    }

    const count = await this.repository.count({ where });
    return count === 0;
  }
}