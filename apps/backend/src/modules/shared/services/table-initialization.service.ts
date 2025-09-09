import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

export interface TableSeeder {
  run(dataSource: DataSource): Promise<void>;
}

@Injectable()
export class TableInitializationService {
  private readonly logger = new Logger(TableInitializationService.name);
  private initializedTables = new Set<string>();

  constructor(private readonly dataSource: DataSource) {}

  /**
   * Ensures a table exists by running its seeder if not already initialized
   * @param tableName - Unique identifier for the table (e.g., 'firebase_configs')
   * @param seeder - Seeder class that implements the TableSeeder interface
   * @param failSilently - Whether to suppress errors and continue app execution
   */
  async ensureTableExists(
    tableName: string,
    seeder: TableSeeder,
    failSilently: boolean = true
  ): Promise<boolean> {
    if (this.initializedTables.has(tableName)) {
      return true;
    }

    try {
      await seeder.run(this.dataSource);
      this.initializedTables.add(tableName);
      this.logger.log(`Table initialization completed: ${tableName}`);
      return true;
    } catch (error) {
      const errorMessage = `Table initialization failed for ${tableName}: ${error.message}`;
      
      if (failSilently) {
        this.logger.warn(errorMessage);
        return false;
      } else {
        this.logger.error(errorMessage);
        throw error;
      }
    }
  }

  /**
   * Check if a specific table has been initialized
   */
  isTableInitialized(tableName: string): boolean {
    return this.initializedTables.has(tableName);
  }

  /**
   * Reset initialization status (useful for testing)
   */
  resetInitializationStatus(tableName?: string): void {
    if (tableName) {
      this.initializedTables.delete(tableName);
    } else {
      this.initializedTables.clear();
    }
  }

  /**
   * Get list of all initialized tables
   */
  getInitializedTables(): string[] {
    return Array.from(this.initializedTables);
  }
}