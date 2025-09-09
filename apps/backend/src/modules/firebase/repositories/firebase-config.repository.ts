import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FirebaseConfigEntity } from '../entities/firebase-config.entity';

@Injectable()
export class FirebaseConfigRepository {
  constructor(
    @InjectRepository(FirebaseConfigEntity)
    private readonly repository: Repository<FirebaseConfigEntity>,
  ) {}

  async findActiveConfig(): Promise<FirebaseConfigEntity | null> {
    return this.repository.findOne({
      where: { active: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findByName(name: string): Promise<FirebaseConfigEntity | null> {
    return this.repository.findOne({
      where: { name },
    });
  }

  async createConfig(data: Partial<FirebaseConfigEntity>): Promise<FirebaseConfigEntity> {
    const config = this.repository.create(data);
    return this.repository.save(config);
  }

  async updateConfig(id: string, data: Partial<FirebaseConfigEntity>): Promise<FirebaseConfigEntity> {
    await this.repository.update(id, data);
    const updated = await this.repository.findOne({ where: { id } });
    if (!updated) {
      throw new Error('Firebase config not found');
    }
    return updated;
  }

  async setActiveConfig(id: string): Promise<void> {
    // Deactivate all configs
    await this.repository.update({}, { active: false });
    
    // Activate the specified config
    await this.repository.update(id, { active: true });
  }

  async findById(id: string): Promise<FirebaseConfigEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findAll(): Promise<FirebaseConfigEntity[]> {
    return this.repository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async deleteConfig(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}