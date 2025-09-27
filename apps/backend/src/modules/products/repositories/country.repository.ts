import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from '../entities/country.entity';

@Injectable()
export class CountryRepository {
  constructor(
    @InjectRepository(Country)
    private readonly repository: Repository<Country>,
  ) {}

  async create(countryData: Partial<Country>): Promise<Country> {
    const country = this.repository.create(countryData);
    return this.repository.save(country);
  }

  async findById(id: string): Promise<Country | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  async findByCode(code: string): Promise<Country | null> {
    return this.repository.findOne({
      where: [{ code }, { iso2: code }, { iso3: code }],
    });
  }

  async findAll(): Promise<Country[]> {
    return this.repository.find({
      order: { name: 'ASC' },
    });
  }

  async update(id: string, updateData: Partial<Country>): Promise<Country | null> {
    await this.repository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }

  async count(): Promise<number> {
    return this.repository.count();
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }

  async findAllBy(where: any): Promise<Country[]> {
    return this.repository.find({
      where,
      order: { name: 'ASC' },
    });
  }
}