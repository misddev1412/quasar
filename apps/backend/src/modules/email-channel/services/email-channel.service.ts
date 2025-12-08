import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { EmailChannel } from '../entities/email-channel.entity';
import { EmailChannelRepository } from '../repositories/email-channel.repository';
import { CreateEmailChannelDto, UpdateEmailChannelDto } from '../dto/email-channel.dto';

@Injectable()
export class EmailChannelService {
  constructor(
    private readonly emailChannelRepository: EmailChannelRepository,
  ) {}

  async getChannels(params: {
    page: number;
    limit: number;
    search?: string;
    isActive?: boolean;
    providerName?: string;
    usageType?: string;
  }) {
    try {
      const result = await this.emailChannelRepository.findPaginated(params);
      
      return {
        success: true,
        data: result,
        message: 'Email channels retrieved successfully',
      };
    } catch (error) {
      throw new BadRequestException(`Failed to retrieve email channels: ${error.message}`);
    }
  }

  async getChannelById(id: string) {
    try {
      const channel = await this.emailChannelRepository.findById(id);
      
      if (!channel) {
        throw new NotFoundException('Email channel not found');
      }

      return {
        success: true,
        data: channel,
        message: 'Email channel retrieved successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to retrieve email channel: ${error.message}`);
    }
  }

  async getActiveChannels() {
    try {
      const channels = await this.emailChannelRepository.findActiveChannels();
      
      return {
        success: true,
        data: channels,
        message: 'Active email channels retrieved successfully',
      };
    } catch (error) {
      throw new BadRequestException(`Failed to retrieve active email channels: ${error.message}`);
    }
  }

  async getChannelsByUsageType(usageType: string) {
    try {
      const channels = await this.emailChannelRepository.findByUsageType(usageType);
      
      return {
        success: true,
        data: channels,
        message: `Email channels for ${usageType} retrieved successfully`,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to retrieve email channels by usage type: ${error.message}`);
    }
  }

  async getDefaultChannel() {
    try {
      const channel = await this.emailChannelRepository.findDefault();
      
      if (!channel) {
        throw new NotFoundException('No default email channel found');
      }

      return {
        success: true,
        data: channel,
        message: 'Default email channel retrieved successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to retrieve default email channel: ${error.message}`);
    }
  }

  async createChannel(createDto: CreateEmailChannelDto) {
    try {
      // Validate unique constraints
      const validation = await this.emailChannelRepository.validateUniqueConstraints(createDto.name);
      if (!validation.isValid) {
        throw new ConflictException(validation.errors.join(', '));
      }

      // Validate the channel configuration
      const channelData = new EmailChannel();
      Object.assign(channelData, createDto);
      
      const configValidation = channelData.validateConfig();
      if (!configValidation.isValid) {
        throw new BadRequestException(configValidation.errors.join(', '));
      }

      // If this is set as default, ensure no other channel is default
      if (createDto.isDefault) {
        await this.emailChannelRepository.setAsDefault(''); // Clear all defaults first
      }

      const channel = await this.emailChannelRepository.create(createDto);

      return {
        success: true,
        data: channel,
        message: 'Email channel created successfully',
      };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to create email channel: ${error.message}`);
    }
  }

  async updateChannel(id: string, updateDto: UpdateEmailChannelDto) {
    try {
      // Check if channel exists
      const existingChannel = await this.emailChannelRepository.findById(id);
      if (!existingChannel) {
        throw new NotFoundException('Email channel not found');
      }

      // Validate unique constraints if name is being updated
      if (updateDto.name && updateDto.name !== existingChannel.name) {
        const validation = await this.emailChannelRepository.validateUniqueConstraints(updateDto.name, id);
        if (!validation.isValid) {
          throw new ConflictException(validation.errors.join(', '));
        }
      }

      // Validate the updated configuration
      const updatedChannelData = new EmailChannel();
      Object.assign(updatedChannelData, existingChannel, updateDto);
      
      const configValidation = updatedChannelData.validateConfig();
      if (!configValidation.isValid) {
        throw new BadRequestException(configValidation.errors.join(', '));
      }

      // If this is set as default, ensure no other channel is default
      if (updateDto.isDefault && !existingChannel.isDefault) {
        await this.emailChannelRepository.setAsDefault(''); // Clear all defaults first
      }

      const updatedChannel = await this.emailChannelRepository.update(id, updateDto);

      return {
        success: true,
        data: updatedChannel,
        message: 'Email channel updated successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to update email channel: ${error.message}`);
    }
  }

  async deleteChannel(id: string) {
    try {
      const existingChannel = await this.emailChannelRepository.findById(id);
      if (!existingChannel) {
        throw new NotFoundException('Email channel not found');
      }

      // Prevent deletion of default channel
      if (existingChannel.isDefault) {
        throw new BadRequestException('Cannot delete the default email channel. Please set another channel as default first.');
      }

      await this.emailChannelRepository.deleteEmailChannel(id);

      return {
        success: true,
        data: null,
        message: 'Email channel deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to delete email channel: ${error.message}`);
    }
  }

  async setAsDefault(id: string) {
    try {
      const existingChannel = await this.emailChannelRepository.findById(id);
      if (!existingChannel) {
        throw new NotFoundException('Email channel not found');
      }

      await this.emailChannelRepository.setAsDefault(id);

      const updatedChannel = await this.emailChannelRepository.findById(id);

      return {
        success: true,
        data: updatedChannel,
        message: 'Email channel set as default successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to set email channel as default: ${error.message}`);
    }
  }

  async testChannel(id: string) {
    try {
      const channel = await this.emailChannelRepository.findById(id);
      if (!channel) {
        throw new NotFoundException('Email channel not found');
      }

      // Validate configuration
      const configValidation = channel.validateConfig();
      if (!configValidation.isValid) {
        throw new BadRequestException(`Channel configuration is invalid: ${configValidation.errors.join(', ')}`);
      }

      // In a real implementation, you would test the SMTP connection here
      // For now, we'll just validate the configuration
      const smtpConfig = channel.getSmtpConfig();
      
      return {
        success: true,
        data: {
          channelId: id,
          channelName: channel.name,
          smtpConfig: {
            host: smtpConfig.host,
            port: smtpConfig.port,
            secure: smtpConfig.secure,
            hasAuth: !!smtpConfig.auth,
          },
          testResult: 'Configuration valid - connection test would be performed here',
        },
        message: 'Email channel test completed successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to test email channel: ${error.message}`);
    }
  }

  async cloneChannel(id: string, newName: string) {
    try {
      const existingChannel = await this.emailChannelRepository.findById(id);
      if (!existingChannel) {
        throw new NotFoundException('Email channel not found');
      }

      // Validate unique name
      const validation = await this.emailChannelRepository.validateUniqueConstraints(newName);
      if (!validation.isValid) {
        throw new ConflictException(validation.errors.join(', '));
      }

      const clonedData = existingChannel.clone(newName);
      const clonedChannel = await this.emailChannelRepository.create(clonedData as any);

      return {
        success: true,
        data: clonedChannel,
        message: 'Email channel cloned successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(`Failed to clone email channel: ${error.message}`);
    }
  }
}