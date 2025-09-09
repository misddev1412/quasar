import { Injectable, BadRequestException } from '@nestjs/common';
import { FirebaseConfigRepository } from '../repositories/firebase-config.repository';
import { FirebaseConfigEntity } from '../entities/firebase-config.entity';

export interface CreateFirebaseConfigDto {
  name: string;
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
  measurementId?: string;
  serviceAccountKey?: string;
  description?: string;
}

export interface UpdateFirebaseConfigDto {
  name?: string;
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
  serviceAccountKey?: string;
  description?: string;
  active?: boolean;
}

@Injectable()
export class FirebaseConfigService {
  constructor(
    private readonly firebaseConfigRepository: FirebaseConfigRepository,
  ) {}

  async getActiveConfig(): Promise<FirebaseConfigEntity | null> {
    try {
      return await this.firebaseConfigRepository.findActiveConfig();
    } catch (error) {
      // If Firebase table doesn't exist or has schema issues, return null
      // This allows the app to continue working without Firebase
      return null;
    }
  }

  async getWebConfig() {
    const config = await this.getActiveConfig();
    if (!config) {
      return null;
    }
    return config.getWebConfig();
  }

  async getAdminConfig() {
    try {
      const config = await this.getActiveConfig();
      if (!config) {
        return null;
      }
      return config.getAdminConfig();
    } catch (error) {
      // Handle any config parsing errors gracefully
      return null;
    }
  }

  async createConfig(data: CreateFirebaseConfigDto): Promise<FirebaseConfigEntity> {
    // Check if name already exists
    const existing = await this.firebaseConfigRepository.findByName(data.name);
    if (existing) {
      throw new BadRequestException('Firebase configuration with this name already exists. Please choose a different name.');
    }

    // Validate service account key if provided
    if (data.serviceAccountKey) {
      try {
        const parsed = JSON.parse(data.serviceAccountKey);
        
        // Check if it has the required service account structure
        if (!parsed.type || parsed.type !== 'service_account') {
          throw new BadRequestException('Invalid service account key: missing or incorrect "type" field. Must be "service_account"');
        }
        
        if (!parsed.project_id) {
          throw new BadRequestException('Invalid service account key: missing "project_id" field');
        }
        
        if (!parsed.private_key_id || !parsed.private_key) {
          throw new BadRequestException('Invalid service account key: missing private key information');
        }
        
        if (!parsed.client_email) {
          throw new BadRequestException('Invalid service account key: missing "client_email" field');
        }
        
      } catch (e) {
        if (e instanceof BadRequestException) {
          throw e;
        }
        throw new BadRequestException('Invalid service account key: must be valid JSON format');
      }
    }

    return this.firebaseConfigRepository.createConfig(data);
  }

  async updateConfig(id: string, data: UpdateFirebaseConfigDto): Promise<FirebaseConfigEntity> {
    // Validate service account key if provided
    if (data.serviceAccountKey) {
      try {
        const parsed = JSON.parse(data.serviceAccountKey);
        
        // Check if it has the required service account structure
        if (!parsed.type || parsed.type !== 'service_account') {
          throw new BadRequestException('Invalid service account key: missing or incorrect "type" field. Must be "service_account"');
        }
        
        if (!parsed.project_id) {
          throw new BadRequestException('Invalid service account key: missing "project_id" field');
        }
        
        if (!parsed.private_key_id || !parsed.private_key) {
          throw new BadRequestException('Invalid service account key: missing private key information');
        }
        
        if (!parsed.client_email) {
          throw new BadRequestException('Invalid service account key: missing "client_email" field');
        }
        
      } catch (e) {
        if (e instanceof BadRequestException) {
          throw e;
        }
        throw new BadRequestException('Invalid service account key: must be valid JSON format');
      }
    }

    return this.firebaseConfigRepository.updateConfig(id, data);
  }

  async setActiveConfig(id: string): Promise<void> {
    return this.firebaseConfigRepository.setActiveConfig(id);
  }

  async getConfigById(id: string): Promise<FirebaseConfigEntity | null> {
    return this.firebaseConfigRepository.findById(id);
  }

  async getAllConfigs(): Promise<FirebaseConfigEntity[]> {
    return this.firebaseConfigRepository.findAll();
  }

  async deleteConfig(id: string): Promise<void> {
    return this.firebaseConfigRepository.deleteConfig(id);
  }

  async validateConfig(config: CreateFirebaseConfigDto | UpdateFirebaseConfigDto): Promise<boolean> {
    // Basic validation for required Firebase config fields
    const requiredFields = [
      { field: 'apiKey', name: 'Web API Key' },
      { field: 'authDomain', name: 'Auth Domain' },
      { field: 'projectId', name: 'Project ID' },
      { field: 'appId', name: 'App ID' }
    ];
    
    for (const { field, name } of requiredFields) {
      if (!(field in config) || !config[field] || (typeof config[field] === 'string' && !config[field].trim())) {
        throw new BadRequestException(`${name} is required and cannot be empty`);
      }
    }

    // Validate field formats
    if (config.apiKey && typeof config.apiKey === 'string') {
      if (!config.apiKey.startsWith('AIza') || config.apiKey.length < 20) {
        throw new BadRequestException('Invalid Web API Key format. API Key should start with "AIza" and be at least 20 characters long');
      }
    }

    if (config.authDomain && typeof config.authDomain === 'string') {
      if (!config.authDomain.includes('.') || !config.authDomain.endsWith('.firebaseapp.com')) {
        throw new BadRequestException('Invalid Auth Domain format. Should be in format: "your-project.firebaseapp.com"');
      }
    }

    if (config.projectId && typeof config.projectId === 'string') {
      if (!/^[a-z0-9-]+$/.test(config.projectId)) {
        throw new BadRequestException('Invalid Project ID format. Should contain only lowercase letters, numbers, and hyphens');
      }
    }

    if (config.appId && typeof config.appId === 'string') {
      if (!config.appId.includes(':') || !config.appId.includes('web:')) {
        throw new BadRequestException('Invalid App ID format. Should be in format: "1:123456789:web:abcdef"');
      }
    }

    if (config.measurementId && typeof config.measurementId === 'string') {
      if (!config.measurementId.startsWith('G-') || config.measurementId.length < 5) {
        throw new BadRequestException('Invalid Measurement ID format. Should start with "G-" and be at least 5 characters long');
      }
    }

    return true;
  }
}