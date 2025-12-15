import {
  ExportColumnDefinition,
  ExportFormat,
  ExportJobOptions,
} from '../entities/data-export-job.entity';
import { ExportJobPayload } from '../interfaces/export-payload.interface';

export interface ExportPaginationParams {
  page: number;
  limit: number;
}

export interface ExportPageResult<T = any> {
  items: T[];
  total: number;
}

export abstract class BaseExportHandler<TFilters = Record<string, any>, TRecord = any> {
  /**
   * Unique resource identifier. Example: `users`, `products`
   */
  abstract readonly resource: string;

  /**
   * Default format if none specified by requester
   */
  readonly defaultFormat: ExportFormat = 'csv';

  /**
   * Page size fallback (can be overridden per handler)
   */
  readonly defaultPageSize = 500;

  /**
   * Return list of available columns
   */
  abstract getColumns(): ExportColumnDefinition[];

  /**
   * Fetch paginated data
   */
  abstract fetchPage(
    params: ExportPaginationParams,
    filters?: TFilters
  ): Promise<ExportPageResult<TRecord>>;

  /**
   * Transform a record to a flat object before serialization
   */
  transformRecord(record: TRecord): Record<string, any> {
    return record as unknown as Record<string, any>;
  }

  /**
   * Allow handlers to provide custom filename
   */
  buildFileName(payload: ExportJobPayload): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${payload.resource}-export-${timestamp}.${payload.format}`;
  }

  resolveColumns(requested?: ExportColumnDefinition[] | null): ExportColumnDefinition[] {
    const available = this.getColumns();

    if (!requested || requested.length === 0) {
      return available;
    }

    const availableMap = new Map(available.map(col => [col.key, col]));
    return requested
      .map(col => availableMap.get(col.key) || col)
      .filter(Boolean) as ExportColumnDefinition[];
  }

  resolvePageSize(options?: ExportJobOptions): number {
    if (options?.pageSize && options.pageSize > 0) {
      return options.pageSize;
    }
    return this.defaultPageSize;
  }

  supportsFormat(format: ExportFormat): boolean {
    return ['csv', 'json'].includes(format);
  }
}
