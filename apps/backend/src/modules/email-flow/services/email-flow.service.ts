import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { EmailFlow } from '../entities/email-flow.entity';
import { EmailFlowRepository } from '../repositories/email-flow.repository';
import { MailProviderRepository } from '../../mail-provider/repositories/mail-provider.repository';

@Injectable()
export class EmailFlowService {
  constructor(
    private readonly emailFlowRepository: EmailFlowRepository,
    private readonly mailProviderRepository: MailProviderRepository,
  ) {}

  async getFlows(params: {
    page: number;
    limit: number;
    search?: string;
    isActive?: boolean;
    mailProviderId?: string;
  }) {
    try {
      const result = await this.emailFlowRepository.findPaginated(params);
      
      return {
        success: true,
        data: result,
        message: 'Email flows retrieved successfully',
      };
    } catch (error) {
      throw new BadRequestException(`Failed to retrieve email flows: ${error.message}`);
    }
  }

  async getFlowById(id: string) {
    try {
      const flow = await this.emailFlowRepository.findByIdWithProvider(id);
      
      if (!flow) {
        throw new NotFoundException('Email flow not found');
      }

      return {
        success: true,
        data: flow,
        message: 'Email flow retrieved successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to retrieve email flow: ${error.message}`);
    }
  }

  async getActiveFlows() {
    try {
      const flows = await this.emailFlowRepository.findActiveFlows();
      
      return {
        success: true,
        data: flows,
        message: 'Active email flows retrieved successfully',
      };
    } catch (error) {
      throw new BadRequestException(`Failed to retrieve active email flows: ${error.message}`);
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
        throw new BadRequestException('Cannot get flows for inactive mail provider');
      }

      const flows = await this.emailFlowRepository.findActiveFlowsByProvider(mailProviderId);
      
      return {
        success: true,
        data: flows,
        message: 'Email flows retrieved successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to retrieve email flows by provider: ${error.message}`);
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
        throw new BadRequestException('Cannot create flow for inactive mail provider');
      }

      const flow = await this.emailFlowRepository.createEmailFlow(createDto);

      return {
        success: true,
        data: flow,
        message: 'Email flow created successfully',
      };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to create email flow: ${error.message}`);
    }
  }

  async updateFlow(id: string, updateDto: Partial<EmailFlow>) {
    try {
      // Check if flow exists
      const existingFlow = await this.emailFlowRepository.findById(id);
      if (!existingFlow) {
        throw new NotFoundException('Email flow not found');
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
          throw new BadRequestException('Cannot update flow to use inactive mail provider');
        }
      }

      const flow = await this.emailFlowRepository.update(id, updateDto);

      return {
        success: true,
        data: flow,
        message: 'Email flow updated successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to update email flow: ${error.message}`);
    }
  }

  async deleteFlow(id: string) {
    try {
      const flow = await this.emailFlowRepository.findById(id);
      if (!flow) {
        throw new NotFoundException('Email flow not found');
      }

      await this.emailFlowRepository.deleteEmailFlow(id);

      return {
        success: true,
        data: { id },
        message: 'Email flow deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to delete email flow: ${error.message}`);
    }
  }
}




