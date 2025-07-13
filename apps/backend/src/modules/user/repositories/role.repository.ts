import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BaseRepository } from '@shared';
import { Role } from '../entities/role.entity';

@Injectable()
export class RoleRepository extends BaseRepository<Role> {
  constructor(private readonly dataSource: DataSource) {
    super(dataSource.getRepository(Role));
  }
} 