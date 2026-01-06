import { Injectable, Logger } from '@nestjs/common';
import { FileUploadService } from '../../storage/services/file-upload.service';
import { DataExportService } from './data-export.service';
import { ExportHandlerRegistry } from './export-handler.registry';
import { BaseExportHandler } from '../handlers/base-export.handler';
import { ExportJobPayload } from '../interfaces/export-payload.interface';
import { DataExportJob, ExportColumnDefinition } from '../entities/data-export-job.entity';
import { StorageService } from '../../storage/services/storage.service';
import { StorageConfig, S3StorageConfig, UploadResult } from '../../storage/interfaces/storage.interface';
import { extractS3KeyFromUrl, trimTrailingSlash } from '../../storage/utils/storage-url.util';
import { NotificationService } from '../../notifications/services/notification.service';
import { NotificationEvent } from '../../notifications/entities/notification-event.enum';
import { NotificationType } from '../../notifications/entities/notification.entity';

@Injectable()
export class WorkerExportService {
  private readonly logger = new Logger(WorkerExportService.name);

  constructor(
    private readonly dataExportService: DataExportService,
    private readonly handlerRegistry: ExportHandlerRegistry,
    private readonly fileUploadService: FileUploadService,
    private readonly storageService: StorageService,
    private readonly notificationService: NotificationService,
  ) {}

  async processExport(payload: ExportJobPayload): Promise<void> {
    const job = await this.dataExportService.getJob(payload.jobId);
    if (!job) {
      throw new Error(`Export job ${payload.jobId} not found`);
    }

    const handler = this.handlerRegistry.get(payload.resource);
    if (!handler) {
      throw new Error(`No export handler registered for resource ${payload.resource}`);
    }

    if (!handler.supportsFormat(payload.format)) {
      throw new Error(`Format ${payload.format} is not supported for ${payload.resource}`);
    }

    await this.dataExportService.markProcessing(job.id);

    try {
      const storageConfig = await this.storageService.getStorageConfig();
      const cdnRewrite = this.buildCdnRewrite(storageConfig);
      const exportResult = await this.generateFile(handler, payload, cdnRewrite || undefined);
      const uploadResult = await this.fileUploadService.uploadFile(
        {
          originalname: exportResult.fileName,
          mimetype: exportResult.mimeType,
          buffer: exportResult.buffer,
          size: exportResult.buffer.length,
          encoding: 'utf-8',
        } as any,
        {
          folder: 'exports',
          filename: exportResult.fileName,
          allowedTypes: [exportResult.mimeType],
        }
      );

      await this.dataExportService.markCompleted(job.id, {
        totalRecords: exportResult.totalRecords,
        fileUrl: uploadResult.url,
        fileName: uploadResult.filename,
        fileSize: uploadResult.size ?? exportResult.buffer.length,
        storageProvider: uploadResult.provider,
      });

      await this.notifyRequesterOnCompletion(job, exportResult.totalRecords, uploadResult);

      this.logger.log(
        `Export job ${job.id} completed. ${exportResult.totalRecords} records uploaded to ${uploadResult.url}`
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      await this.dataExportService.markFailed(job.id, errorMessage);
      await this.notifyRequesterOnFailure(job, errorMessage);
      this.logger.error(`Export job ${job.id} failed: ${errorMessage}`);
      throw error;
    }
  }

  private async generateFile(
    handler: BaseExportHandler,
    payload: ExportJobPayload,
    cdnRewrite?: (url: string) => string
  ): Promise<{ buffer: Buffer; fileName: string; mimeType: string; totalRecords: number }> {
    const columns = handler.resolveColumns(payload.columns);
    const pageSize = handler.resolvePageSize(payload.options);
    const format = payload.format || handler.defaultFormat;

    const csvLines: string[] = [];
    const jsonRows: Record<string, unknown>[] = [];
    let total = 0;

    if (format === 'csv') {
      csvLines.push(columns.map(col => this.escapeCsv(col.label || col.key)).join(','));
    }

    let page = 1;
    let fetchedAll = false;

    while (!fetchedAll) {
      const result = await handler.fetchPage({ page, limit: pageSize }, payload.filters);
      if (!result.items.length) {
        break;
      }

      for (const rawRecord of result.items) {
        const record = handler.transformRecord(rawRecord);
        if (format === 'csv') {
          const values = columns.map(col => {
            const raw = this.getColumnValue(record, col, cdnRewrite);
            return this.escapeCsv(this.formatValue(raw));
          });
          csvLines.push(values.join(','));
        } else {
          jsonRows.push(this.buildJsonRow(record, columns, cdnRewrite));
        }
      }

      total += result.items.length;

      if (total >= result.total || result.items.length < pageSize) {
        fetchedAll = true;
      } else {
        page += 1;
      }
    }

    const fileName = payload.options?.fileName || handler.buildFileName(payload);
    if (format === 'csv') {
      const csvBuffer = Buffer.from(csvLines.join('\n'), 'utf-8');
      return {
        buffer: csvBuffer,
        fileName: fileName.endsWith('.csv') ? fileName : `${fileName}.csv`,
        mimeType: 'text/csv',
        totalRecords: total,
      };
    }

    const jsonBuffer = Buffer.from(JSON.stringify(jsonRows, null, 2), 'utf-8');
    return {
      buffer: jsonBuffer,
      fileName: fileName.endsWith('.json') ? fileName : `${fileName}.json`,
      mimeType: 'application/json',
      totalRecords: total,
    };
  }

  private buildJsonRow(
    record: Record<string, any>,
    columns: ExportColumnDefinition[],
    cdnRewrite?: (url: string) => string
  ): Record<string, any> {
    return columns.reduce<Record<string, any>>((acc, column) => {
      acc[column.key] = this.getColumnValue(record, column, cdnRewrite);
      return acc;
    }, {});
  }

  private getColumnValue(
    record: Record<string, any>,
    column: ExportColumnDefinition,
    cdnRewrite?: (url: string) => string
  ): any {
    const path = column.path || column.key;
    const value = path.split('.').reduce<any>((acc, key) => {
      if (acc === null || acc === undefined) return acc;
      return acc[key];
    }, record);

    if (typeof value === 'string' && cdnRewrite) {
      return cdnRewrite(value);
    }

    return value;
  }

  private formatValue(value: any): string {
    if (value === null || value === undefined) return '';
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  private escapeCsv(value: string): string {
    if (value === undefined || value === null) {
      return '';
    }

    const needsQuotes = /[",\n]/.test(value);
    const sanitized = value.replace(/"/g, '""');
    return needsQuotes ? `"${sanitized}"` : sanitized;
  }

  private buildCdnRewrite(config: StorageConfig): ((url: string) => string) | null {
    if (config.provider !== 's3') {
      return null;
    }

    const s3Config = config as S3StorageConfig;
    if (!s3Config.cdnUrl) {
      return null;
    }

    const normalizedCdn = trimTrailingSlash(s3Config.cdnUrl);

    return (url: string): string => {
      if (!url) {
        return url;
      }

      const key = extractS3KeyFromUrl(url, {
        bucket: s3Config.bucket,
        cdnUrl: s3Config.cdnUrl,
        endpoint: s3Config.endpoint,
      });

      return key ? `${normalizedCdn}/${key}` : url;
    };
  }

  private async notifyRequesterOnCompletion(
    job: DataExportJob,
    totalRecords: number,
    uploadResult: UploadResult
  ): Promise<void> {
    if (!job.requestedBy) {
      return;
    }

    const payload = {
      userId: job.requestedBy,
      title: 'Export ready for download',
      body: `Your export for ${job.resource} is complete with ${totalRecords} records.`,
      type: NotificationType.SUCCESS,
      actionUrl: '/users/exports',
      data: {
        jobId: job.id,
        resource: job.resource,
        fileName: uploadResult.filename,
        fileUrl: uploadResult.url,
        format: job.format,
      },
      eventKey: NotificationEvent.DATA_EXPORT_COMPLETED,
    } as const;

    await this.ensureInAppNotification(payload);
  }

  private async notifyRequesterOnFailure(job: DataExportJob, errorMessage: string): Promise<void> {
    if (!job.requestedBy) {
      return;
    }

    const payload = {
      userId: job.requestedBy,
      title: 'Export failed',
      body: `Your export for ${job.resource} failed: ${errorMessage}`,
      type: NotificationType.ERROR,
      actionUrl: '/users/exports',
      data: {
        jobId: job.id,
        resource: job.resource,
        error: errorMessage,
      },
      eventKey: NotificationEvent.DATA_EXPORT_FAILED,
    } as const;

    await this.ensureInAppNotification(payload);
  }

  private async ensureInAppNotification(payload: {
    userId: string;
    title: string;
    body: string;
    type: NotificationType;
    actionUrl?: string;
    data?: Record<string, unknown>;
    eventKey: NotificationEvent;
  }): Promise<void> {
    try {
      const notification = await this.notificationService.sendNotificationToUser({
        ...payload,
        sendPush: false,
      });

      if (!notification) {
        await this.notificationService.createNotification({
          userId: payload.userId,
          title: payload.title,
          body: payload.body,
          type: payload.type,
          actionUrl: payload.actionUrl,
          data: payload.data,
          eventKey: payload.eventKey,
        });
      }
    } catch (error) {
      this.logger.warn(
        `Failed to notify requester ${payload.userId} about export event`,
        error instanceof Error ? error.stack : String(error)
      );
    }
  }
}
