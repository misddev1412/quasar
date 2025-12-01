import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { MailProvider } from '../entities/mail-provider.entity';
import { MailProviderRepository } from '../repositories/mail-provider.repository';
import * as net from 'net';
import * as tls from 'tls';
import { URLSearchParams } from 'url';
import axios from 'axios';
import AWS from 'aws-sdk';
import { MailLogService } from '../../mail-log/services/mail-log.service';
import { MailLogStatus } from '../../mail-log/entities/mail-log.entity';
import { CreateMailLogDto } from '../../mail-log/dto/mail-log.dto';

@Injectable()
export class MailProviderService {
  constructor(
    private readonly mailProviderRepository: MailProviderRepository,
    private readonly mailLogService: MailLogService,
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

  async testConnection(id: string, testEmail?: string, triggeredBy?: string) {
    try {
      const provider = await this.mailProviderRepository.findById(id);
      if (!provider) {
        throw new NotFoundException('Mail provider not found');
      }

      const emailContent = testEmail ? this.buildTestEmailContent(provider) : undefined;
      const result = await this.testProviderConnection(provider, testEmail, emailContent);

      if (testEmail && emailContent) {
        await this.logProviderTestEmail({
          provider,
          recipient: testEmail,
          content: emailContent,
          result,
          triggeredBy,
        });
      }

      return result;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to test connection: ${error.message}`);
    }
  }

  async testConnectionWithData(providerData: Partial<MailProvider>, testEmail?: string, triggeredBy?: string) {
    try {
      // Create a temporary provider instance for testing
      const provider = new MailProvider();
      Object.assign(provider, providerData);

      // Validate configuration first
      const configValidation = provider.validateConfig();
      if (!configValidation.isValid) {
        throw new BadRequestException(`Configuration is invalid: ${configValidation.errors.join(', ')}`);
      }

      const emailContent = testEmail ? this.buildTestEmailContent(provider) : undefined;
      const result = await this.testProviderConnection(provider, testEmail, emailContent);

      if (testEmail && emailContent) {
        await this.logProviderTestEmail({
          provider,
          recipient: testEmail,
          content: emailContent,
          result,
          triggeredBy,
        });
      }

      return result;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(`Failed to test connection: ${error.message}`);
    }
  }

  private async testProviderConnection(
    provider: MailProvider,
    testEmail?: string,
    emailContent?: { subject: string; text: string; html: string },
  ) {
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
      const smtpTest = await this.testSmtpConnection(provider);
      testResult.success = smtpTest.success;
      testResult.message = smtpTest.message;
      testResult.details = smtpTest.details;
    } else {
      const apiTest = await this.testApiConnection(provider, testEmail);
      testResult.success = apiTest.success;
      testResult.message = apiTest.message;
      testResult.details = apiTest.details;
    }

    if (testEmail) {
      const content = emailContent ?? this.buildTestEmailContent(provider);
      const emailResult = await this.sendTestEmail(provider, testEmail, content);
      testResult.testEmail = {
        recipient: testEmail,
        success: emailResult.success,
        message: emailResult.message,
        details: emailResult.details,
      };
      testResult.emailContent = content;
      testResult.success = emailResult.success;
      testResult.message = emailResult.message;
      testResult.details = {
        ...testResult.details,
        testEmail: emailResult.details,
      };
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
        case 'mailtrap':
          return await this.testMailtrapConnection(provider, testEmail);
        default:
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

  private async sendTestEmail(
    provider: MailProvider,
    recipient: string,
    emailContent?: { subject: string; text: string; html: string },
  ): Promise<{ success: boolean; message: string; details: any }> {
    try {
      switch (provider.providerType) {
        case 'smtp':
          return await this.sendSmtpTestEmail(provider, recipient, emailContent);
        case 'sendgrid':
          return await this.sendSendGridTestEmail(provider, recipient, emailContent);
        case 'mailgun':
          return await this.sendMailgunTestEmail(provider, recipient, emailContent);
        case 'ses':
          return await this.sendSesTestEmail(provider, recipient, emailContent);
        case 'postmark':
          return await this.sendPostmarkTestEmail(provider, recipient, emailContent);
        case 'mandrill':
          return await this.sendMandrillTestEmail(provider, recipient, emailContent);
        case 'mailtrap':
          return await this.sendMailtrapTestEmail(provider, recipient, emailContent);
        default:
          return {
            success: false,
            message: `Sending test email is not supported for provider type ${provider.providerType || 'unknown'}`,
            details: {
              providerType: provider.providerType,
            },
          };
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to send test email: ${error.message}`,
        details: {
          providerType: provider.providerType,
          error: error.message,
        },
      };
    }
  }

  private async logProviderTestEmail(params: {
    provider?: MailProvider;
    recipient: string;
    content: { subject: string; text: string; html: string };
    result: { success: boolean; data?: any; message: string };
    triggeredBy?: string;
  }) {
    try {
      const { provider, recipient, content, result, triggeredBy } = params;
      const testEmailResult = result?.data?.testEmail;
      const status = testEmailResult?.success ? MailLogStatus.SENT : MailLogStatus.FAILED;

      const logPayload: CreateMailLogDto = {
        mailProviderId: provider?.id,
        recipient,
        subject: content.subject,
        bodyPreview: content.text?.slice(0, 1000),
        status,
        isTest: true,
        providerResponse: testEmailResult?.details || result?.data?.details || {},
        errorMessage: status === MailLogStatus.FAILED ? (testEmailResult?.message || result?.message) : undefined,
        triggeredBy,
        sentAt: new Date(),
        fromEmail: provider?.defaultFromEmail || provider?.smtpUsername,
        fromName: provider?.defaultFromName,
        requestPayload: {
          subject: content.subject,
          text: content.text,
          html: content.html,
        },
        metadata: {
          providerName: provider?.name,
          providerType: provider?.providerType,
          context: 'connection_test',
        },
      };

      await this.mailLogService.createLog(logPayload);
    } catch (error) {
      // Logging should not block the primary flow
      console.warn('Failed to record mail log entry', error);
    }
  }

  private getSenderAddress(provider: MailProvider, allowUsernameFallback = false) {
    const fromEmail = provider.defaultFromEmail || (allowUsernameFallback ? provider.smtpUsername : undefined);
    if (!fromEmail) {
      throw new BadRequestException('A default "from" email is required to send a test email. Please update the provider configuration.');
    }

    return {
      email: fromEmail,
      name: provider.defaultFromName || undefined,
    };
  }

  private buildTestEmailContent(provider: MailProvider) {
    const subject = `Test email from ${provider.name || 'Mail Provider'}`;
    const text = `Hello,

This is a connectivity test from ${provider.name || 'your mail provider'} at ${new Date().toISOString()}.

If you are receiving this message, your provider is able to send outbound mail.

Best regards,
Quasar Platform`;
    const html = `<p>Hello,</p><p>This is a connectivity test from <strong>${provider.name || 'your mail provider'}</strong> at <strong>${new Date().toISOString()}</strong>.</p><p>If you are receiving this message, your provider is able to send outbound mail.</p><p>Best regards,<br />Quasar Platform</p>`;
    return { subject, text, html };
  }

  private formatFromAddress(from: { email: string; name?: string }) {
    return from.name ? `"${from.name}" <${from.email}>` : from.email;
  }

  private async sendSmtpTestEmail(
    provider: MailProvider,
    recipient: string,
    emailContent?: { subject: string; text: string; html: string },
  ) {
    if (!provider.smtpHost || !provider.smtpPort) {
      return {
        success: false,
        message: 'SMTP host and port are required to send test email',
        details: {},
      };
    }

    const from = this.getSenderAddress(provider, true);
    const content = emailContent ?? this.buildTestEmailContent(provider);
    const client = new SimpleSmtpClient({
      host: provider.smtpHost,
      port: provider.smtpPort,
      secure: provider.smtpSecure && provider.smtpPort === 465,
      timeout: 15000,
    });

    try {
      await client.connect();
      await client.ehlo(provider.smtpHost);

      if (provider.smtpSecure && provider.smtpPort !== 465 && !client.isSecure()) {
        await client.startTls(provider.smtpHost);
        await client.ehlo(provider.smtpHost);
      }

      if (provider.smtpUsername && provider.smtpPassword) {
        await client.authLogin(provider.smtpUsername, provider.smtpPassword);
      }

      await client.mailFrom(from.email);
      await client.rcptTo(recipient);
      await client.sendMessage(this.buildSmtpMessage(from, recipient, content.subject, content.text));
      await client.quit();

      return {
        success: true,
        message: `Test email sent successfully via SMTP to ${recipient}`,
        details: {
          providerType: 'smtp',
          recipient,
          host: provider.smtpHost,
          port: provider.smtpPort,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: `SMTP send failed: ${error.message}`,
        details: {
          providerType: 'smtp',
          error: error.message,
        },
      };
    } finally {
      client.close();
    }
  }

  private buildSmtpMessage(from: { email: string; name?: string }, recipient: string, subject: string, text: string) {
    const headers = [
      `From: ${this.formatFromAddress(from)}`,
      `To: ${recipient}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset="utf-8"',
      '',
    ];

    const body = text.replace(/\r?\n/g, '\r\n').replace(/\n\./g, '\n..');
    return `${headers.join('\r\n')}\r\n${body}`;
  }

  private async sendSendGridTestEmail(
    provider: MailProvider,
    recipient: string,
    emailContent?: { subject: string; text: string; html: string },
  ) {
    if (!provider.apiKey) {
      return {
        success: false,
        message: 'SendGrid API key is required to send a test email',
        details: {},
      };
    }

    const from = this.getSenderAddress(provider);
    const { subject, text, html } = emailContent ?? this.buildTestEmailContent(provider);

    try {
      await axios.post(`${provider.apiHost || 'https://api.sendgrid.com'}/v3/mail/send`, {
        personalizations: [
          {
            to: [{ email: recipient }],
            subject,
          },
        ],
        from: {
          email: from.email,
          name: from.name,
        },
        content: [
          { type: 'text/plain', value: text },
          { type: 'text/html', value: html },
        ],
      }, {
        headers: {
          Authorization: `Bearer ${provider.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      });

      return {
        success: true,
        message: `Test email sent successfully via SendGrid to ${recipient}`,
        details: {
          providerType: 'sendgrid',
          recipient,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.errors?.[0]?.message || error.message || 'SendGrid send failed',
        details: {
          providerType: 'sendgrid',
          status: error.response?.status,
          response: error.response?.data,
        },
      };
    }
  }

  private async sendMailgunTestEmail(
    provider: MailProvider,
    recipient: string,
    emailContent?: { subject: string; text: string; html: string },
  ) {
    if (!provider.apiKey) {
      return {
        success: false,
        message: 'Mailgun API key is required to send a test email',
        details: {},
      };
    }

    const from = this.getSenderAddress(provider);
    const { subject, text, html } = emailContent ?? this.buildTestEmailContent(provider);
    const domain = provider.config?.domain || this.extractDomainFromEmail(from.email);

    if (!domain) {
      return {
        success: false,
        message: 'Mailgun domain is required to send test email',
        details: {},
      };
    }

    try {
      const formData = new URLSearchParams();
      formData.append('from', this.formatFromAddress(from));
      formData.append('to', recipient);
      formData.append('subject', subject);
      formData.append('text', text);
      formData.append('html', html);

      const response = await axios.post(`https://api.mailgun.net/v3/${domain}/messages`, formData, {
        auth: {
          username: 'api',
          password: provider.apiKey || '',
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 15000,
      });

      return {
        success: true,
        message: `Test email sent successfully via Mailgun to ${recipient}`,
        details: {
          providerType: 'mailgun',
          recipient,
          id: response.data?.id,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Mailgun send failed',
        details: {
          providerType: 'mailgun',
          status: error.response?.status,
          response: error.response?.data,
        },
      };
    }
  }

  private async sendSesTestEmail(
    provider: MailProvider,
    recipient: string,
    emailContent?: { subject: string; text: string; html: string },
  ) {
    if (!provider.apiKey || !provider.apiSecret) {
      return {
        success: false,
        message: 'AWS SES requires both access key and secret to send emails',
        details: {},
      };
    }

    const from = this.getSenderAddress(provider);
    const { subject, text, html } = emailContent ?? this.buildTestEmailContent(provider);

    try {
      const ses = new AWS.SES({
        accessKeyId: provider.apiKey,
        secretAccessKey: provider.apiSecret,
        region: provider.config?.region || process.env.AWS_REGION || 'us-east-1',
      });

      await ses.sendEmail({
        Source: this.formatFromAddress(from),
        Destination: { ToAddresses: [recipient] },
        Message: {
          Subject: { Data: subject },
          Body: {
            Text: { Data: text },
            Html: { Data: html },
          },
        },
      }).promise();

      return {
        success: true,
        message: `Test email sent successfully via AWS SES to ${recipient}`,
        details: {
          providerType: 'ses',
          recipient,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'AWS SES send failed',
        details: {
          providerType: 'ses',
          error: error.message,
        },
      };
    }
  }

  private async sendPostmarkTestEmail(
    provider: MailProvider,
    recipient: string,
    emailContent?: { subject: string; text: string; html: string },
  ) {
    if (!provider.apiKey) {
      return {
        success: false,
        message: 'Postmark server token is required to send a test email',
        details: {},
      };
    }

    const from = this.getSenderAddress(provider);
    const { subject, text, html } = emailContent ?? this.buildTestEmailContent(provider);

    try {
      const response = await axios.post('https://api.postmarkapp.com/email', {
        From: this.formatFromAddress(from),
        To: recipient,
        Subject: subject,
        HtmlBody: html,
        TextBody: text,
      }, {
        headers: {
          'X-Postmark-Server-Token': provider.apiKey || '',
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      });

      return {
        success: true,
        message: `Test email sent successfully via Postmark to ${recipient}`,
        details: {
          providerType: 'postmark',
          recipient,
          messageId: response.data?.MessageID,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.Message || error.message || 'Postmark send failed',
        details: {
          providerType: 'postmark',
          status: error.response?.status,
          response: error.response?.data,
        },
      };
    }
  }

  private async sendMandrillTestEmail(
    provider: MailProvider,
    recipient: string,
    emailContent?: { subject: string; text: string; html: string },
  ) {
    if (!provider.apiKey) {
      return {
        success: false,
        message: 'Mandrill API key is required to send a test email',
        details: {},
      };
    }

    const from = this.getSenderAddress(provider);
    const { subject, text, html } = emailContent ?? this.buildTestEmailContent(provider);

    try {
      const response = await axios.post('https://mandrillapp.com/api/1.0/messages/send.json', {
        key: provider.apiKey,
        message: {
          subject,
          from_email: from.email,
          from_name: from.name,
          html,
          text,
          to: [{ email: recipient, type: 'to' }],
        },
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      });

      return {
        success: true,
        message: `Test email sent successfully via Mandrill to ${recipient}`,
        details: {
          providerType: 'mandrill',
          recipient,
          result: response.data,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Mandrill send failed',
        details: {
          providerType: 'mandrill',
          status: error.response?.status,
          response: error.response?.data,
        },
      };
    }
  }

  private async sendMailtrapTestEmail(
    provider: MailProvider,
    recipient: string,
    emailContent?: { subject: string; text: string; html: string },
  ) {
    if (!provider.apiKey) {
      return {
        success: false,
        message: 'Mailtrap API token is required to send a test email',
        details: {},
      };
    }

    const from = this.getSenderAddress(provider);
    const { subject, text, html } = emailContent ?? this.buildTestEmailContent(provider);

    try {
      const response = await axios.post(provider.apiHost || 'https://send.api.mailtrap.io/api/send', {
        from: {
          email: from.email,
          name: from.name,
        },
        to: [{ email: recipient }],
        subject,
        text,
        html,
      }, {
        headers: {
          Authorization: `Bearer ${provider.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      });

      return {
        success: true,
        message: `Test email sent successfully via Mailtrap to ${recipient}`,
        details: {
          providerType: 'mailtrap',
          recipient,
          id: response.data?.id,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Mailtrap send failed',
        details: {
          providerType: 'mailtrap',
          status: error.response?.status,
          response: error.response?.data,
        },
      };
    }
  }

  private extractDomainFromEmail(email?: string | null) {
    if (!email) {
      return null;
    }
    const [, domain] = email.split('@');
    return domain || null;
  }

  private async testMailtrapConnection(provider: MailProvider, _testEmail?: string) {
    if (!provider.apiKey) {
      return {
        success: false,
        message: 'Mailtrap API token is required',
        details: {},
      };
    }

    return {
      success: true,
      message: 'Mailtrap API token format validated',
      details: {
        providerType: 'mailtrap',
        apiKeyLength: provider.apiKey.length,
      },
    };
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

type SmtpResponse = { code: number; response: string };

class SimpleSmtpClient {
  private socket: net.Socket | tls.TLSSocket | null = null;
  private buffer = '';
  private pending?: {
    expectedCodes: number[];
    resolve: (value: SmtpResponse) => void;
    reject: (error: Error) => void;
    timer: NodeJS.Timeout;
  };
  private secure = false;

  constructor(
    private readonly options: {
      host: string;
      port: number;
      secure?: boolean;
      timeout?: number;
    },
  ) {}

  async connect() {
    await this.createSocket(this.options.secure ?? false);
    await this.expectResponse([220]);
  }

  isSecure() {
    return this.secure;
  }

  async ehlo(hostname: string) {
    await this.sendCommand(`EHLO ${hostname}`, [250]);
  }

  async startTls(servername: string) {
    await this.sendCommand('STARTTLS', [220]);
    if (!this.socket) {
      throw new Error('SMTP socket not initialized');
    }
    const oldSocket = this.socket;
    this.detachSocket(oldSocket);
    this.socket = await new Promise<tls.TLSSocket>((resolve, reject) => {
      const tlsSocket = tls.connect({
        socket: oldSocket,
        servername,
        rejectUnauthorized: false,
      });
      tlsSocket.once('secureConnect', () => resolve(tlsSocket));
      tlsSocket.once('error', reject);
    });
    this.secure = true;
    this.attachSocket(this.socket);
  }

  async authLogin(username: string, password: string) {
    await this.sendCommand('AUTH LOGIN', [334]);
    await this.sendCommand(Buffer.from(username, 'utf-8').toString('base64'), [334]);
    await this.sendCommand(Buffer.from(password, 'utf-8').toString('base64'), [235, 250]);
  }

  async mailFrom(address: string) {
    await this.sendCommand(`MAIL FROM:<${address}>`, [250]);
  }

  async rcptTo(address: string) {
    await this.sendCommand(`RCPT TO:<${address}>`, [250, 251]);
  }

  async sendMessage(payload: string) {
    await this.sendCommand('DATA', [354]);
    this.socket?.write(`${payload}\r\n.\r\n`);
    await this.expectResponse([250]);
  }

  async quit() {
    try {
      await this.sendCommand('QUIT', [221]);
    } finally {
      this.close();
    }
  }

  close() {
    if (this.socket) {
      this.detachSocket(this.socket);
      this.socket.end();
      this.socket.destroy();
      this.socket = null;
    }
    if (this.pending) {
      clearTimeout(this.pending.timer);
      this.pending = undefined;
    }
  }

  private async createSocket(useTls: boolean) {
    const socket = await new Promise<net.Socket | tls.TLSSocket>((resolve, reject) => {
      const socketInstance = useTls
        ? tls.connect({
            host: this.options.host,
            port: this.options.port,
            servername: this.options.host,
            rejectUnauthorized: false,
          })
        : net.createConnection({
            host: this.options.host,
            port: this.options.port,
          });

      const connectEvent = useTls ? 'secureConnect' : 'connect';

      const onConnect = () => {
        socketInstance.removeListener('error', onError);
        resolve(socketInstance);
      };

      const onError = (error: Error) => {
        socketInstance.removeListener(connectEvent, onConnect);
        reject(error);
      };

      socketInstance.once(connectEvent, onConnect);
      socketInstance.once('error', onError);
    });

    this.secure = !!useTls;
    this.socket = socket;
    this.attachSocket(socket);
  }

  private attachSocket(socket: net.Socket | tls.TLSSocket) {
    socket.on('data', this.handleData);
    socket.on('error', this.handleSocketError);
    socket.on('close', this.handleSocketClose);
  }

  private detachSocket(socket: net.Socket | tls.TLSSocket) {
    socket.off('data', this.handleData);
    socket.off('error', this.handleSocketError);
    socket.off('close', this.handleSocketClose);
  }

  private handleData = (chunk: Buffer) => {
    this.buffer += chunk.toString();
    this.processBuffer();
  };

  private handleSocketError = (error: Error) => {
    if (this.pending) {
      const pending = this.pending;
      this.pending = undefined;
      clearTimeout(pending.timer);
      pending.reject(error);
    }
  };

  private handleSocketClose = () => {
    if (this.pending) {
      const pending = this.pending;
      this.pending = undefined;
      clearTimeout(pending.timer);
      pending.reject(new Error('SMTP connection closed unexpectedly'));
    }
  };

  private async sendCommand(command: string, expectedCodes: number[]) {
    if (!this.socket) {
      throw new Error('SMTP socket not initialized');
    }
    this.socket.write(`${command}\r\n`);
    await this.expectResponse(expectedCodes);
  }

  private expectResponse(expectedCodes: number[]): Promise<SmtpResponse> {
    if (this.pending) {
      throw new Error('A previous SMTP command is still awaiting a response');
    }

    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending = undefined;
        reject(new Error('SMTP response timed out'));
      }, this.options.timeout ?? 10000);

      this.pending = {
        expectedCodes,
        resolve: (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        reject: (error) => {
          clearTimeout(timer);
          reject(error);
        },
        timer,
      };

      this.processBuffer();
    });
  }

  private processBuffer() {
    if (!this.pending) {
      return;
    }

    const parsed = this.parseResponse(this.buffer);
    if (!parsed) {
      return;
    }

    this.buffer = '';
    const pending = this.pending;
    this.pending = undefined;

    if (!pending.expectedCodes.includes(parsed.code)) {
      pending.reject(new Error(parsed.response));
      return;
    }

    pending.resolve(parsed);
  }

  private parseResponse(buffer: string): SmtpResponse | null {
    const lines = buffer.split(/\r?\n/).filter((line) => line.length > 0);
    if (!lines.length) {
      return null;
    }

    const lastLine = lines[lines.length - 1];
    if (!/^\d{3}[ -]/.test(lastLine)) {
      return null;
    }

    if (lastLine[3] === '-') {
      return null;
    }

    const code = parseInt(lastLine.substring(0, 3), 10);
    if (Number.isNaN(code)) {
      return null;
    }

    return {
      code,
      response: lines.join('\n'),
    };
  }
}
