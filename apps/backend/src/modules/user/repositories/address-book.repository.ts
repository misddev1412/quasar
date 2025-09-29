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
      relations: ['user'],
    });
  }

  async findByUserId(userId: string): Promise<AddressBook[]> {
    return this.repository.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async findByUserIdAndType(
    userId: string,
    addressType: AddressType,
  ): Promise<AddressBook[]> {
    return this.repository.find({
      where: [
        { userId, addressType },
        { userId, addressType: AddressType.BOTH },
      ],
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async findDefaultByUserId(userId: string): Promise<AddressBook | null> {
    return this.repository.findOne({
      where: { userId, isDefault: true },
    });
  }

  async findDefaultByUserIdAndType(
    userId: string,
    addressType: AddressType,
  ): Promise<AddressBook | null> {
    return this.repository.findOne({
      where: [
        { userId, addressType, isDefault: true },
        { userId, addressType: AddressType.BOTH, isDefault: true },
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

  async setAsDefault(id: string, userId: string): Promise<void> {
    // First, unset all default addresses for this user
    await this.repository.update(
      { userId },
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

  async countByUserId(userId: string): Promise<number> {
    return this.repository.count({
      where: { userId },
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
      relations: ['user'],
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
    userId: string,
    addressType: AddressType,
    excludeId?: string,
  ): Promise<boolean> {
    const where: FindOptionsWhere<AddressBook> = {
      userId,
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