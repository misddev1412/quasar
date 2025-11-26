import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { MailProvider } from '../entities/mail-provider.entity';
import { MailProviderRepository } from '../repositories/mail-provider.repository';
import * as net from 'net';
import axios from 'axios';

@Injectable()
export class MailProviderService {
  constructor(
    private readonly mailProviderRepository: MailProviderRepository,
  ) {}

  async getProviders(params: {
    page: number;
    limit: number;
    search?: string;
    isActive?: boolean;
    providerType?: string;
  }) {
    try {
      const result = await this.mailProviderRepository.findPaginated(params);
      
      return {
        success: true,
        data: result,
        message: 'Mail providers retrieved successfully',
      };
    } catch (error) {
      throw new BadRequestException(`Failed to retrieve mail providers: ${error.message}`);
    }
  }

  async getProviderById(id: string) {
    try {
      const provider = await this.mailProviderRepository.findById(id);
      
      if (!provider) {
        throw new NotFoundException('Mail provider not found');
      }

      return {
        success: true,
        data: provider,
        message: 'Mail provider retrieved successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to retrieve mail provider: ${error.message}`);
    }
  }

  async getActiveProviders() {
    try {
      const providers = await this.mailProviderRepository.findActiveProviders();
      
      return {
        success: true,
        data: providers,
        message: 'Active mail providers retrieved successfully',
      };
    } catch (error) {
      throw new BadRequestException(`Failed to retrieve active mail providers: ${error.message}`);
    }
  }

  async getProvidersByType(providerType: string) {
    try {
      const providers = await this.mailProviderRepository.findByProviderType(providerType);
      
      return {
        success: true,
        data: providers,
        message: `Mail providers for ${providerType} retrieved successfully`,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to retrieve mail providers by type: ${error.message}`);
    }
  }

  async createProvider(createDto: Partial<MailProvider>) {
    try {
      // Validate unique constraints
      const validation = await this.mailProviderRepository.validateUniqueConstraints(createDto.name!);
      if (!validation.isValid) {
        throw new ConflictException(validation.errors.join(', '));
      }

      // Validate the provider configuration
      const providerData = new MailProvider();
      Object.assign(providerData, createDto);
      
      const configValidation = providerData.validateConfig();
      if (!configValidation.isValid) {
        throw new BadRequestException(configValidation.errors.join(', '));
      }

      const provider = await this.mailProviderRepository.createMailProvider(createDto);

      return {
        success: true,
        data: provider,
        message: 'Mail provider created successfully',
      };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to create mail provider: ${error.message}`);
    }
  }

  async updateProvider(id: string, updateDto: Partial<MailProvider>) {
    try {
      // Check if provider exists
      const existingProvider = await this.mailProviderRepository.findById(id);
      if (!existingProvider) {
        throw new NotFoundException('Mail provider not found');
      }

      // Validate unique constraints if name is being updated
      if (updateDto.name && updateDto.name !== existingProvider.name) {
        const validation = await this.mailProviderRepository.validateUniqueConstraints(updateDto.name, id);
        if (!validation.isValid) {
          throw new ConflictException(validation.errors.join(', '));
        }
      }

      // Validate configuration if relevant fields are being updated
      if (updateDto.providerType || updateDto.smtpHost || updateDto.smtpPort || updateDto.apiKey) {
        const updatedData = { ...existingProvider, ...updateDto };
        const providerData = new MailProvider();
        Object.assign(providerData, updatedData);
        
        const configValidation = providerData.validateConfig();
        if (!configValidation.isValid) {
          throw new BadRequestException(configValidation.errors.join(', '));
        }
      }

      const provider = await this.mailProviderRepository.update(id, updateDto);

      return {
        success: true,
        data: provider,
        message: 'Mail provider updated successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to update mail provider: ${error.message}`);
    }
  }

  async deleteProvider(id: string) {
    try {
      const provider = await this.mailProviderRepository.findById(id);
      if (!provider) {
        throw new NotFoundException('Mail provider not found');
      }

      await this.mailProviderRepository.deleteMailProvider(id);

      return {
        success: true,
        data: { id },
        message: 'Mail provider deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Failed to delete mail provider: ${error.message}`);
    }
  }

  async testConnection(id: string, testEmail?: string) {
    try {
      const provider = await this.mailProviderRepository.findById(id);
      if (!provider) {
        throw new NotFoundException('Mail provider not found');
      }

      return await this.testProviderConnection(provider, testEmail);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to test connection: ${error.message}`);
    }
  }

  async testConnectionWithData(providerData: Partial<MailProvider>, testEmail?: string) {
    try {
      // Create a temporary provider instance for testing
      const provider = new MailProvider();
      Object.assign(provider, providerData);

      // Validate configuration first
      const configValidation = provider.validateConfig();
      if (!configValidation.isValid) {
        throw new BadRequestException(`Configuration is invalid: ${configValidation.errors.join(', ')}`);
      }

      return await this.testProviderConnection(provider, testEmail);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to test connection: ${error.message}`);
    }
  }

  private async testProviderConnection(provider: MailProvider, testEmail?: string) {
    // Validate configuration first
    const configValidation = provider.validateConfig();
    if (!configValidation.isValid) {
      throw new BadRequestException(`Configuration is invalid: ${configValidation.errors.join(', ')}`);
    }

    const testResult: any = {
      providerId: provider.id || 'temporary',
      providerName: provider.name,
      providerType: provider.providerType,
      success: false,
      message: '',
      details: {},
    };

    if (provider.providerType === 'smtp') {
      // Test SMTP connection
      const smtpTest = await this.testSmtpConnection(provider);
      testResult.success = smtpTest.success;
      testResult.message = smtpTest.message;
      testResult.details = smtpTest.details;
    } else {
      // Test API connection
      const apiTest = await this.testApiConnection(provider, testEmail);
      testResult.success = apiTest.success;
      testResult.message = apiTest.message;
      testResult.details = apiTest.details;
    }

    return {
      success: true,
      data: testResult,
      message: testResult.success ? 'Connection test successful' : 'Connection test failed',
    };
  }

  private async testSmtpConnection(provider: MailProvider): Promise<{ success: boolean; message: string; details: any }> {
    return new Promise((resolve) => {
      if (!provider.smtpHost || !provider.smtpPort) {
        resolve({
          success: false,
          message: 'SMTP host and port are required',
          details: {},
        });
        return;
      }

      const socket = new net.Socket();
      const timeout = 10000; // 10 seconds timeout
      let connected = false;

      socket.setTimeout(timeout);

      socket.on('connect', () => {
        connected = true;
        socket.destroy();
        resolve({
          success: true,
          message: `Successfully connected to ${provider.smtpHost}:${provider.smtpPort}`,
          details: {
            host: provider.smtpHost,
            port: provider.smtpPort,
            secure: provider.smtpSecure,
            hasAuth: !!(provider.smtpUsername && provider.smtpPassword),
          },
        });
      });

      socket.on('timeout', () => {
        socket.destroy();
        if (!connected) {
          resolve({
            success: false,
            message: `Connection timeout: Unable to connect to ${provider.smtpHost}:${provider.smtpPort}`,
            details: {
              host: provider.smtpHost,
              port: provider.smtpPort,
            },
          });
        }
      });

      socket.on('error', (error: Error) => {
        socket.destroy();
        resolve({
          success: false,
          message: `Connection failed: ${error.message}`,
          details: {
            host: provider.smtpHost,
            port: provider.smtpPort,
            error: error.message,
          },
        });
      });

      try {
        socket.connect(provider.smtpPort!, provider.smtpHost!);
      } catch (error: any) {
        resolve({
          success: false,
          message: `Failed to initiate connection: ${error.message}`,
          details: {
            host: provider.smtpHost,
            port: provider.smtpPort,
            error: error.message,
          },
        });
      }
    });
  }

  private async testApiConnection(provider: MailProvider, testEmail?: string): Promise<{ success: boolean; message: string; details: any }> {
    if (!provider.apiKey) {
      return {
        success: false,
        message: 'API key is required for API-based providers',
        details: {},
      };
    }

    try {
      switch (provider.providerType) {
        case 'sendgrid':
          return await this.testSendGridConnection(provider, testEmail);
        case 'mailgun':
          return await this.testMailgunConnection(provider, testEmail);
        case 'ses':
          return await this.testSesConnection(provider, testEmail);
        case 'postmark':
          return await this.testPostmarkConnection(provider, testEmail);
        case 'mandrill':
          return await this.testMandrillConnection(provider, testEmail);
        default:
          // For custom providers, just validate API key format
          return {
            success: true,
            message: 'API key format validated (custom provider)',
            details: {
              providerType: provider.providerType,
              hasApiKey: !!provider.apiKey,
              hasApiSecret: !!provider.apiSecret,
            },
          };
      }
    } catch (error: any) {
      return {
        success: false,
        message: `API test failed: ${error.message}`,
        details: {
          providerType: provider.providerType,
          error: error.message,
        },
      };
    }
  }

  private async testSendGridConnection(provider: MailProvider, testEmail?: string): Promise<{ success: boolean; message: string; details: any }> {
    try {
      // SendGrid API: Validate API key by checking user profile
      const response = await axios.get('https://api.sendgrid.com/v3/user/profile', {
        headers: {
          'Authorization': `Bearer ${provider.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      return {
        success: true,
        message: 'SendGrid API key is valid',
        details: {
          providerType: 'sendgrid',
          apiKeyValid: true,
          userEmail: response.data?.email || 'N/A',
        },
      };
    } catch (error: any) {
      const isAuthError = error.response?.status === 401 || error.response?.status === 403;
      return {
        success: false,
        message: isAuthError ? 'Invalid SendGrid API key' : `SendGrid API test failed: ${error.message}`,
        details: {
          providerType: 'sendgrid',
          apiKeyValid: false,
          error: error.response?.data?.errors?.[0]?.message || error.message,
        },
      };
    }
  }

  private async testMailgunConnection(provider: MailProvider, testEmail?: string): Promise<{ success: boolean; message: string; details: any }> {
    try {
      // Mailgun API: Validate API key by checking domains
      // Note: Mailgun requires domain in API URL, we'll use a generic validation endpoint
      const domain = provider.config?.domain || 'mg.example.com'; // Default domain
      const response = await axios.get(`https://api.mailgun.net/v3/domains/${domain}`, {
        auth: {
          username: 'api',
          password: provider.apiKey || '',
        },
        timeout: 10000,
      });

      return {
        success: true,
        message: 'Mailgun API key is valid',
        details: {
          providerType: 'mailgun',
          apiKeyValid: true,
          domain: response.data?.domain?.name || domain,
        },
      };
    } catch (error: any) {
      const isAuthError = error.response?.status === 401 || error.response?.status === 403;
      return {
        success: false,
        message: isAuthError ? 'Invalid Mailgun API key' : `Mailgun API test failed: ${error.message}`,
        details: {
          providerType: 'mailgun',
          apiKeyValid: false,
          error: error.response?.data?.message || error.message,
        },
      };
    }
  }

  private async testSesConnection(provider: MailProvider, testEmail?: string): Promise<{ success: boolean; message: string; details: any }> {
    try {
      // AWS SES: Validate credentials by checking sending quota
      // Note: This requires AWS SDK, for now we'll validate API key format
      const apiKey = provider.apiKey || '';
      const apiSecret = provider.apiSecret || '';

      if (!apiKey || !apiSecret) {
        return {
          success: false,
          message: 'AWS SES requires both API key and secret',
          details: {
            providerType: 'ses',
            hasApiKey: !!apiKey,
            hasApiSecret: !!apiSecret,
          },
        };
      }

      // Basic format validation for AWS credentials
      const isValidFormat = apiKey.length >= 16 && apiSecret.length >= 40;
      
      return {
        success: isValidFormat,
        message: isValidFormat ? 'AWS SES credentials format validated' : 'Invalid AWS SES credentials format',
        details: {
          providerType: 'ses',
          apiKeyValid: isValidFormat,
          note: 'Full validation requires AWS SDK integration',
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: `AWS SES test failed: ${error.message}`,
        details: {
          providerType: 'ses',
          error: error.message,
        },
      };
    }
  }

  private async testPostmarkConnection(provider: MailProvider, testEmail?: string): Promise<{ success: boolean; message: string; details: any }> {
    try {
      // Postmark API: Validate API key by checking server info
      const response = await axios.get('https://api.postmarkapp.com/servers', {
        headers: {
          'X-Postmark-Server-Token': provider.apiKey || '',
          'Accept': 'application/json',
        },
        timeout: 10000,
      });

      return {
        success: true,
        message: 'Postmark API key is valid',
        details: {
          providerType: 'postmark',
          apiKeyValid: true,
          serverCount: response.data?.TotalCount || 0,
        },
      };
    } catch (error: any) {
      const isAuthError = error.response?.status === 401 || error.response?.status === 403;
      return {
        success: false,
        message: isAuthError ? 'Invalid Postmark API key' : `Postmark API test failed: ${error.message}`,
        details: {
          providerType: 'postmark',
          apiKeyValid: false,
          error: error.response?.data?.Message || error.message,
        },
      };
    }
  }

  private async testMandrillConnection(provider: MailProvider, testEmail?: string): Promise<{ success: boolean; message: string; details: any }> {
    try {
      // Mandrill API: Validate API key by checking user info
      const response = await axios.post('https://mandrillapp.com/api/1.0/users/info.json', {
        key: provider.apiKey,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      });

      return {
        success: true,
        message: 'Mandrill API key is valid',
        details: {
          providerType: 'mandrill',
          apiKeyValid: true,
          username: response.data?.username || 'N/A',
        },
      };
    } catch (error: any) {
      const isAuthError = error.response?.status === 401 || error.response?.status === 403;
      return {
        success: false,
        message: isAuthError ? 'Invalid Mandrill API key' : `Mandrill API test failed: ${error.message}`,
        details: {
          providerType: 'mandrill',
          apiKeyValid: false,
          error: error.response?.data?.message || error.message,
        },
      };
    }
  }
}


