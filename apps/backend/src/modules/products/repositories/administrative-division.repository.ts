import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { AdministrativeDivision } from '../entities/administrative-division.entity';

@Injectable()
export class AdministrativeDivisionRepository {
  constructor(
    @InjectRepository(AdministrativeDivision)
    private readonly repository: Repository<AdministrativeDivision>,
  ) {}

  async create(divisionData: Partial<AdministrativeDivision>): Promise<AdministrativeDivision> {
    const division = this.repository.create(divisionData);
    return this.repository.save(division);
  }

  async findById(id: string): Promise<AdministrativeDivision | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['country'],
    });
  }

  async findByCountryId(countryId: string): Promise<AdministrativeDivision[]> {
    return this.repository.find({
      where: { countryId },
      order: { name: 'ASC' },
    });
  }

  async findByParentId(parentId: string): Promise<AdministrativeDivision[]> {
    return this.repository.find({
      where: { parentId },
      order: { name: 'ASC' },
    });
  }

  async findByCountryIdAndType(countryId: string, type: string): Promise<AdministrativeDivision[]> {
    return this.repository.find({
      where: { countryId, type: type as any },
      order: { name: 'ASC' },
    });
  }

  async findAll(): Promise<AdministrativeDivision[]> {
    return this.repository.find({
      order: { name: 'ASC' },
    });
  }

  async findAllBy(where: FindOptionsWhere<AdministrativeDivision>): Promise<AdministrativeDivision[]> {
    return this.repository.find({
      where,
      order: { name: 'ASC' },
    });
  }

  async update(id: string, updateData: Partial<AdministrativeDivision>): Promise<AdministrativeDivision | null> {
    await this.repository.update(id, updateData);
    return this.findById(id);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }

  async count(where?: FindOptionsWhere<AdministrativeDivision>): Promise<number> {
    return this.repository.count({ where });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.repository.count({ where: { id } });
    return count > 0;
  }
}