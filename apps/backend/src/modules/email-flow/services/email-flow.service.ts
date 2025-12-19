import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { EmailFlow } from '../entities/email-flow.entity';
import { EmailFlowRepository } from '../repositories/email-flow.repository';
import { MailProviderRepository } from '../../mail-provider/repositories/mail-provider.repository';
import { MailTemplateRepository } from '../../mail-template/repositories/mail-template.repository';

@Injectable()
export class EmailFlowService {
  constructor(
    private readonly emailFlowRepository: EmailFlowRepository,
    private readonly mailProviderRepository: MailProviderRepository,
    private readonly mailTemplateRepository: MailTemplateRepository,
  ) {}

  async getFlows(params: {
    page: number;
    limit: number;
    search?: string;
    isActive?: boolean;
    mailProviderId?: string;
    mailTemplateId?: string;
  }) {
    try {
      const result = await this.emailFlowRepository.findPaginated(params);
      
      return {
        success: true,
        data: result,
        message: 'Mail channel priorities retrieved successfully',
      };
    } catch (error) {
      throw new BadRequestException(`Failed to retrieve mail channel priorities: ${error.message}`);
    }
  }

  async getFlowById(id: string) {
    try {
      const flow = await this.emailFlowRepository.findByIdWithProvider(id);
      
      if (!flow) {
        throw new NotFoundException('Mail channel priority not found');
      }

      return {
        success: true,
        data: flow,
        message: 'Mail channel priority retrieved successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to retrieve mail channel priority: ${error.message}`);
    }
  }

  async getActiveFlows() {
    try {
      const flows = await this.emailFlowRepository.findActiveFlows();
      
      return {
        success: true,
        data: flows,
        message: 'Active mail channel priorities retrieved successfully',
      };
    } catch (error) {
      throw new BadRequestException(`Failed to retrieve active mail channel priorities: ${error.message}`);
    }
  }

  async getFlowsByProvider(mailProviderId: string) {
    try {
      // Verify provider exists and is active
      const provider = await this.mailProviderRepository.findById(mailProviderId);
      if (!provider) {
        throw new NotFoundException('Mail provider not found');
      }
      if (!provider.isActive) {
        throw new BadRequestException('Cannot get priorities for inactive mail provider');
      }

      const flows = await this.emailFlowRepository.findActiveFlowsByProvider(mailProviderId);
      
      return {
        success: true,
        data: flows,
        message: 'Mail channel priorities retrieved successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to retrieve mail channel priorities by provider: ${error.message}`);
    }
  }

  async createFlow(createDto: Partial<EmailFlow>) {
    try {
      // Validate unique constraints
      const validation = await this.emailFlowRepository.validateUniqueConstraints(createDto.name!);
      if (!validation.isValid) {
        throw new ConflictException(validation.errors.join(', '));
      }

      // Verify mail provider exists and is active
      const provider = await this.mailProviderRepository.findById(createDto.mailProviderId!);
      if (!provider) {
        throw new NotFoundException('Mail provider not found');
      }
      if (!provider.isActive) {
        throw new BadRequestException('Cannot create priority for inactive mail provider');
      }

      const flow = await this.emailFlowRepository.createEmailFlow(createDto);

      return {
        success: true,
        data: flow,
        message: 'Mail channel priority created successfully',
      };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to create mail channel priority: ${error.message}`);
    }
  }

  async updateFlow(id: string, updateDto: Partial<EmailFlow>) {
    try {
      // Check if flow exists
      const existingFlow = await this.emailFlowRepository.findById(id);
      if (!existingFlow) {
        throw new NotFoundException('Mail channel priority not found');
      }

      // Validate unique constraints if name is being updated
      if (updateDto.name && updateDto.name !== existingFlow.name) {
        const validation = await this.emailFlowRepository.validateUniqueConstraints(updateDto.name, id);
        if (!validation.isValid) {
          throw new ConflictException(validation.errors.join(', '));
        }
      }

      // Verify mail provider exists and is active if being updated
      if (updateDto.mailProviderId) {
        const provider = await this.mailProviderRepository.findById(updateDto.mailProviderId);
        if (!provider) {
          throw new NotFoundException('Mail provider not found');
        }
        if (!provider.isActive) {
          throw new BadRequestException('Cannot update priority to use inactive mail provider');
        }
      }

      if (updateDto.mailTemplateId) {
        const template = await this.mailTemplateRepository.findById(updateDto.mailTemplateId);
        if (!template) {
          throw new NotFoundException('Mail template not found');
        }
      }

      const flow = await this.emailFlowRepository.update(id, updateDto);

      return {
        success: true,
        data: flow,
        message: 'Mail channel priority updated successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to update mail channel priority: ${error.message}`);
    }
  }

  async deleteFlow(id: string) {
    try {
      const flow = await this.emailFlowRepository.findById(id);
      if (!flow) {
        throw new NotFoundException('Mail channel priority not found');
      }

      await this.emailFlowRepository.deleteEmailFlow(id);

      return {
        success: true,
        data: { id },
        message: 'Mail channel priority deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to delete mail channel priority: ${error.message}`);
    }
  }
}
