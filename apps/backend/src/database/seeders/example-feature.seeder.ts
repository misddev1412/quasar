import { DataSource } from 'typeorm';
import { TableSeeder } from '../../modules/shared/services/table-initialization.service';

/**
 * Example seeder showing how to implement the TableSeeder interface
 * for any new optional feature that needs database tables
 */
export class ExampleFeatureSeeder implements TableSeeder {
  async run(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();
    
    try {
      // Check if your table exists
      const tableExists = await queryRunner.hasTable('your_feature_table');
      
      if (!tableExists) {
        // Create your feature table with all required columns
        await queryRunner.query(`
          CREATE TABLE "your_feature_table" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            "version" integer NOT NULL DEFAULT 1,
            "created_by" uuid,
            "updated_by" uuid,
            "deleted_at" TIMESTAMP,
            "deleted_by" uuid,
            -- Add your feature-specific columns here
            "feature_name" character varying(255) NOT NULL,
            "is_enabled" boolean NOT NULL DEFAULT true,
            CONSTRAINT "PK_your_feature_table" PRIMARY KEY ("id")
          )
        `);

        // Add any indexes needed
        await queryRunner.query(`
          CREATE INDEX "IDX_YOUR_FEATURE_NAME" ON "your_feature_table" ("feature_name")
        `);
      } else {
        // Table exists, check and add any missing columns (for upgrades)
        await this.addMissingColumns(queryRunner);
      }
    } catch (error) {
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async addMissingColumns(queryRunner: any): Promise<void> {
    // Example: Add a new column that was added in a later version
    const newColumnExists = await queryRunner.hasColumn('your_feature_table', 'new_column');
    if (!newColumnExists) {
      await queryRunner.query(`ALTER TABLE "your_feature_table" ADD "new_column" varchar(255)`);
    }
  }
}

/*
Usage in your service:

@Injectable()
export class YourFeatureService {
  private readonly yourFeatureSeeder = new ExampleFeatureSeeder();

  constructor(
    private readonly tableInitializationService: TableInitializationService,
    // ... other dependencies
  ) {}

  private async ensureTableExists(): Promise<boolean> {
    return this.tableInitializationService.ensureTableExists(
      'your_feature_table',
      this.yourFeatureSeeder,
      true // fail silently to not block the app
    );
  }

  async someMethod() {
    await this.ensureTableExists();
    // ... your feature logic
  }
}
*/