import { Injectable, Logger } from '@nestjs/common';
import { BaseExportHandler } from '../handlers/base-export.handler';

@Injectable()
export class ExportHandlerRegistry {
  private readonly logger = new Logger(ExportHandlerRegistry.name);
  private handlers = new Map<string, BaseExportHandler>();

  register(handler: BaseExportHandler): void {
    if (this.handlers.has(handler.resource)) {
      this.logger.warn(`Export handler for ${handler.resource} already registered. Overwriting.`);
    }

    this.handlers.set(handler.resource, handler);
  }

  get(resource: string): BaseExportHandler | undefined {
    return this.handlers.get(resource);
  }

  list(): string[] {
    return Array.from(this.handlers.keys());
  }
}
