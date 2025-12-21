import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductSpecificationLabelsTable1764200000000 implements MigrationInterface {
  name = 'CreateProductSpecificationLabelsTable1764200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "product_specification_labels" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "group_name" character varying(150) NOT NULL,
        "group_code" character varying(150),
        "label" character varying(255) NOT NULL,
        "description" text,
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "usage_count" integer NOT NULL DEFAULT 0,
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "version" integer NOT NULL DEFAULT 1,
        "created_by" uuid,
        "updated_by" uuid,
        CONSTRAINT "PK_product_specification_labels" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_spec_labels_group_label" ON "product_specification_labels" ("group_name", "label")`);
    await queryRunner.query(`CREATE INDEX "IDX_spec_labels_group" ON "product_specification_labels" ("group_name")`);
    await queryRunner.query(`CREATE INDEX "IDX_spec_labels_active" ON "product_specification_labels" ("is_active")`);

    await queryRunner.query(`ALTER TABLE "product_specifications" ADD "label_id" uuid`);
    await queryRunner.query(`CREATE INDEX "IDX_product_specifications_label_id" ON "product_specifications" ("label_id")`);
    await queryRunner.query(`
      ALTER TABLE "product_specifications"
      ADD CONSTRAINT "FK_product_specifications_label"
      FOREIGN KEY ("label_id") REFERENCES "product_specification_labels"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "product_specifications" DROP CONSTRAINT "FK_product_specifications_label"`);
    await queryRunner.query(`DROP INDEX "IDX_product_specifications_label_id"`);
    await queryRunner.query(`ALTER TABLE "product_specifications" DROP COLUMN "label_id"`);

    await queryRunner.query(`DROP INDEX "IDX_spec_labels_active"`);
    await queryRunner.query(`DROP INDEX "IDX_spec_labels_group"`);
    await queryRunner.query(`DROP INDEX "IDX_spec_labels_group_label"`);
    await queryRunner.query(`DROP TABLE "product_specification_labels"`);
  }
}
