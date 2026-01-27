import { BadRequestException, Injectable } from '@nestjs/common';
import { OpenAiConfigRepository } from '../repositories/openai-config.repository';
import { OpenAiConfigEntity } from '../entities/openai-config.entity';

export interface CreateOpenAiConfigDto {
  name: string;
  model: string;
  apiKey: string;
  baseUrl?: string;
  description?: string;
  active?: boolean;
}

export interface UpdateOpenAiConfigDto {
  name?: string;
  model?: string;
  apiKey?: string;
  baseUrl?: string;
  description?: string;
  active?: boolean;
}

@Injectable()
export class OpenAiConfigService {
  constructor(
    private readonly openAiConfigRepository: OpenAiConfigRepository,
  ) {}

  async getActiveConfig(): Promise<OpenAiConfigEntity | null> {
    try {
      return await this.openAiConfigRepository.findActiveConfig();
    } catch (error) {
      return null;
    }
  }

  async createConfig(data: CreateOpenAiConfigDto): Promise<OpenAiConfigEntity> {
    const existing = await this.openAiConfigRepository.findByName(data.name);
    if (existing) {
      throw new BadRequestException('OpenAI configuration with this name already exists. Please choose a different name.');
    }

    const created = await this.openAiConfigRepository.createConfig({
      name: data.name,
      model: data.model,
      apiKey: data.apiKey,
      baseUrl: data.baseUrl,
      description: data.description,
      active: data.active ?? true,
    });

    if (created.active) {
      await this.openAiConfigRepository.setActiveConfig(created.id);
      return this.openAiConfigRepository.findById(created.id) as Promise<OpenAiConfigEntity>;
    }

    return created;
  }

  async updateConfig(id: string, data: UpdateOpenAiConfigDto): Promise<OpenAiConfigEntity> {
    const updated = await this.openAiConfigRepository.updateConfig(id, data);

    if (data.active) {
      await this.openAiConfigRepository.setActiveConfig(id);
      return this.openAiConfigRepository.findById(id) as Promise<OpenAiConfigEntity>;
    }

    return updated;
  }

  async getConfigById(id: string): Promise<OpenAiConfigEntity | null> {
    return this.openAiConfigRepository.findById(id);
  }

  async getAllConfigs(): Promise<OpenAiConfigEntity[]> {
    return this.openAiConfigRepository.findAll();
  }

  async deleteConfig(id: string): Promise<void> {
    return this.openAiConfigRepository.deleteConfig(id);
  }
}
