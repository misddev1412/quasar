import { Injectable, Logger } from '@nestjs/common';
import { MailProviderService } from '../../mail-provider/services/mail-provider.service';
import { MailLogService } from '../../mail-log/services/mail-log.service';
import { MailTemplateService } from '../../mail-template/services/mail-template.service';
import { MailLogStatus } from '../../mail-log/entities/mail-log.entity';
import { EmailPayload, EmailResult } from '../interfaces/worker-payloads.interface';

@Injectable()
export class WorkerEmailService {
  private readonly logger = new Logger(WorkerEmailService.name);

  constructor(
    private readonly mailProviderService: MailProviderService,
    private readonly mailLogService: MailLogService,
    private readonly mailTemplateService: MailTemplateService,
  ) {}

  /**
   * Send email using the configured mail provider
   */
  async sendEmail(payload: EmailPayload): Promise<EmailResult> {
    this.logger.log(`Sending email to: ${payload.to}`);

    try {
      // Get active provider
      const providersResponse = await this.mailProviderService.getActiveProviders();
      const providers = providersResponse.data || [];

      if (!providers.length) {
        throw new Error('No active mail providers available');
      }

      // Select provider (use specified or first active with highest priority)
      const provider = payload.providerId
        ? providers.find((p: any) => p.id === payload.providerId)
        : providers.sort((a: any, b: any) => a.priority - b.priority)[0];

      if (!provider) {
        throw new Error('Mail provider not found');
      }

      // Process template if specified
      let emailContent = {
        subject: payload.subject,
        text: payload.body || '',
        html: payload.html || payload.body || '',
      };

      if (payload.templateId) {
        const templateContent = await this.processTemplate(
          payload.templateId,
          payload.templateData || {}
        );
        if (templateContent) {
          emailContent = {
            ...emailContent,
            ...templateContent,
          };
        }
      }

      // Send via provider service
      const result = await this.mailProviderService.testConnectionWithData(
        provider,
        payload.to,
        payload.triggeredBy
      );

      const success = result.data?.testEmail?.success || false;

      // Log the email
      await this.mailLogService.createLog({
        mailProviderId: provider.id,
        recipient: payload.to,
        cc: payload.cc,
        bcc: payload.bcc,
        subject: emailContent.subject,
        bodyPreview: emailContent.text?.slice(0, 1000),
        status: success ? MailLogStatus.SENT : MailLogStatus.FAILED,
        isTest: false,
        fromEmail: payload.fromEmail || provider.defaultFromEmail,
        fromName: payload.fromName || provider.defaultFromName,
        sentAt: success ? new Date() : undefined,
        errorMessage: success ? undefined : result.data?.testEmail?.message,
        providerResponse: result.data?.details || {},
        triggeredBy: payload.triggeredBy,
        metadata: payload.metadata,
        requestPayload: {
          subject: emailContent.subject,
          text: emailContent.text,
          html: emailContent.html,
        },
      });

      return {
        success,
        messageId: result.data?.testEmail?.details?.messageId,
        provider: provider.name,
        details: result.data?.details,
        error: success ? undefined : result.data?.testEmail?.message,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to send email: ${errorMessage}`);

      // Log failed attempt
      await this.mailLogService.createLog({
        recipient: payload.to,
        subject: payload.subject,
        bodyPreview: payload.body?.slice(0, 1000),
        status: MailLogStatus.FAILED,
        isTest: false,
        errorMessage,
        triggeredBy: payload.triggeredBy,
        metadata: payload.metadata,
      });

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmails(
    payloads: EmailPayload[],
    options?: { batchSize?: number; delayMs?: number }
  ): Promise<{ total: number; success: number; failed: number; results: EmailResult[] }> {
    const batchSize = options?.batchSize || 10;
    const delayMs = options?.delayMs || 100;
    const results: EmailResult[] = [];

    this.logger.log(`Sending bulk emails: ${payloads.length} recipients`);

    for (let i = 0; i < payloads.length; i += batchSize) {
      const batch = payloads.slice(i, i + batchSize);
      
      const batchResults = await Promise.all(
        batch.map(payload => this.sendEmail(payload))
      );
      
      results.push(...batchResults);

      // Delay between batches to avoid rate limiting
      if (i + batchSize < payloads.length) {
        await this.sleep(delayMs);
      }
    }

    const success = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    this.logger.log(`Bulk email complete: ${success} success, ${failed} failed`);

    return {
      total: payloads.length,
      success,
      failed,
      results,
    };
  }

  /**
   * Process email template
   */
  private async processTemplate(
    templateId: string,
    data: Record<string, unknown>
  ): Promise<{ subject?: string; text?: string; html?: string } | null> {
    try {
      const template = await this.mailTemplateService.getTemplateById(templateId);

      if (!template) {
        this.logger.warn(`Template not found: ${templateId}`);
        return null;
      }

      // Simple variable replacement
      let subject = template.subject || '';
      let text = template.body || '';
      let html = template.body || '';

      Object.entries(data).forEach(([key, value]) => {
        const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        const valueStr = String(value ?? '');
        subject = subject.replace(placeholder, valueStr);
        text = text.replace(placeholder, valueStr);
        html = html.replace(placeholder, valueStr);
      });

      return { subject, text, html };
    } catch (error) {
      this.logger.error(`Failed to process template: ${error}`);
      return null;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
