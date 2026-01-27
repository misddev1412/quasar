import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OpenAiConfigEntity } from '../entities/openai-config.entity';

@Injectable()
export class OpenAiConfigRepository {
  constructor(
    @InjectRepository(OpenAiConfigEntity)
    private readonly repository: Repository<OpenAiConfigEntity>,
  ) {}

  async findActiveConfig(): Promise<OpenAiConfigEntity | null> {
    return this.repository.findOne({
      where: { active: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findByName(name: string): Promise<OpenAiConfigEntity | null> {
    return this.repository.findOne({ where: { name } });
  }

  async createConfig(data: Partial<OpenAiConfigEntity>): Promise<OpenAiConfigEntity> {
    const config = this.repository.create(data);
    return this.repository.save(config);
  }

  async updateConfig(id: string, data: Partial<OpenAiConfigEntity>): Promise<OpenAiConfigEntity> {
    await this.repository.update(id, data);
    const updated = await this.repository.findOne({ where: { id } });
    if (!updated) {
      throw new Error('OpenAI config not found');
    }
    return updated;
  }

  async setActiveConfig(id: string): Promise<void> {
    await this.repository.update({}, { active: false });
    await this.repository.update(id, { active: true });
  }

  async findById(id: string): Promise<OpenAiConfigEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findAll(): Promise<OpenAiConfigEntity[]> {
    return this.repository.find({ order: { createdAt: 'DESC' } });
  }

  async deleteConfig(id: string): Promise<void> {
    await this.repository.softDelete(id);
  }
}
