import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from '@shared';
import { SEOEntity } from '../entities/seo.entity';
import { SEORepositoryInterface } from '../interfaces/seo-repository.interface';

@Injectable()
export class SEORepository extends BaseRepository<SEOEntity> implements SEORepositoryInterface {
  constructor(
    @InjectRepository(SEOEntity)
    protected readonly repository: Repository<SEOEntity>
  ) {
    super(repository);
  }

  async findByPath(path: string): Promise<SEOEntity | null> {
    return this.repository.findOne({
      where: { 
        path,
        active: true,
        deletedAt: null
      }
    });
  }

  async existsByPath(path: string): Promise<boolean> {
    const count = await this.repository.count({
      where: { path }
    });
    return count > 0;
  }
} 