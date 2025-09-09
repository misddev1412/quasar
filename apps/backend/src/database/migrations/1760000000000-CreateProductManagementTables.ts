import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductManagementTables1760000000000 implements MigrationInterface {
    name = 'CreateProductManagementTables1760000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create brands table
        await queryRunner.query(`
            CREATE TABLE "brands" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "description" text,
                "logo" character varying(500),
                "website" character varying(500),
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_96db6bbbaa6f23cad26871339b6" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_brands_name" UNIQUE ("name")
            )
        `);

        // Create categories table
        await queryRunner.query(`
            CREATE TABLE "categories" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "description" text,
                "parentId" uuid,
                "image" character varying(500),
                "isActive" boolean NOT NULL DEFAULT true,
                "sortOrder" integer NOT NULL DEFAULT 0,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"),
                CONSTRAINT "FK_categories_parent" FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL
            )
        `);

        // Create attributes table
        await queryRunner.query(`
            CREATE TABLE "attributes" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "displayName" character varying(255),
                "type" character varying(20) NOT NULL CHECK ("type" IN ('TEXT', 'NUMBER', 'BOOLEAN', 'SELECT', 'MULTISELECT', 'COLOR', 'DATE')),
                "isRequired" boolean NOT NULL DEFAULT false,
                "isFilterable" boolean NOT NULL DEFAULT false,
                "sortOrder" integer NOT NULL DEFAULT 0,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_32216ac2e9b6e1d86bf35adf6b7" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_attributes_name" UNIQUE ("name")
            )
        `);

        // Create attribute_values table
        await queryRunner.query(`
            CREATE TABLE "attribute_values" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "attributeId" uuid NOT NULL,
                "value" character varying(500) NOT NULL,
                "displayValue" character varying(500),
                "sortOrder" integer NOT NULL DEFAULT 0,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_f464e5e04dc1bf2fef9ee5d6a8c" PRIMARY KEY ("id"),
                CONSTRAINT "FK_attribute_values_attribute" FOREIGN KEY ("attributeId") REFERENCES "attributes"("id") ON DELETE CASCADE
            )
        `);

        // Create product_tags table
        await queryRunner.query(`
            CREATE TABLE "product_tags" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "slug" character varying(255),
                "color" character varying(7),
                "description" text,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_9ce973b8278cd30f69e93b03e5b" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_product_tags_name" UNIQUE ("name"),
                CONSTRAINT "UQ_product_tags_slug" UNIQUE ("slug")
            )
        `);

        // Create warranties table
        await queryRunner.query(`
            CREATE TABLE "warranties" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "description" text,
                "durationMonths" integer NOT NULL,
                "type" character varying(20) NOT NULL CHECK ("type" IN ('MANUFACTURER', 'EXTENDED', 'STORE')),
                "terms" text,
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_2f80135b51d54a93e7781d40633" PRIMARY KEY ("id")
            )
        `);

        // Create products table
        await queryRunner.query(`
            CREATE TABLE "products" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "description" text,
                "sku" character varying(100),
                "status" character varying(20) NOT NULL DEFAULT 'DRAFT' CHECK ("status" IN ('DRAFT', 'ACTIVE', 'INACTIVE', 'DISCONTINUED')),
                "brandId" uuid,
                "categoryId" uuid,
                "warrantyId" uuid,
                "images" text,
                "metaTitle" character varying(255),
                "metaDescription" text,
                "metaKeywords" character varying(500),
                "isActive" boolean NOT NULL DEFAULT true,
                "isFeatured" boolean NOT NULL DEFAULT false,
                "sortOrder" integer NOT NULL DEFAULT 0,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_products_sku" UNIQUE ("sku"),
                CONSTRAINT "FK_products_brand" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE SET NULL,
                CONSTRAINT "FK_products_category" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL,
                CONSTRAINT "FK_products_warranty" FOREIGN KEY ("warrantyId") REFERENCES "warranties"("id") ON DELETE SET NULL
            )
        `);

        // Create product_variants table
        await queryRunner.query(`
            CREATE TABLE "product_variants" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "productId" uuid NOT NULL,
                "name" character varying(255) NOT NULL,
                "sku" character varying(100),
                "barcode" character varying(100),
                "price" decimal(10,2) NOT NULL,
                "compareAtPrice" decimal(10,2),
                "costPrice" decimal(10,2),
                "stockQuantity" integer NOT NULL DEFAULT 0,
                "lowStockThreshold" integer,
                "trackInventory" boolean NOT NULL DEFAULT true,
                "allowBackorders" boolean NOT NULL DEFAULT false,
                "weight" decimal(8,2),
                "dimensions" character varying(100),
                "images" text,
                "attributes" jsonb,
                "isActive" boolean NOT NULL DEFAULT true,
                "sortOrder" integer NOT NULL DEFAULT 0,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_e01bb21cdb9d7eb8549e5a30ad4" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_product_variants_sku" UNIQUE ("sku"),
                CONSTRAINT "FK_product_variants_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE
            )
        `);

        // Create product_attributes table
        await queryRunner.query(`
            CREATE TABLE "product_attributes" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "productId" uuid NOT NULL,
                "attributeId" uuid NOT NULL,
                "value" character varying(500) NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_f9c1d6e3f3b8b6b7b8c1d6e3f3b" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_product_attributes_product_attribute" UNIQUE ("productId", "attributeId"),
                CONSTRAINT "FK_product_attributes_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_product_attributes_attribute" FOREIGN KEY ("attributeId") REFERENCES "attributes"("id") ON DELETE CASCADE
            )
        `);

        // Create suppliers table
        await queryRunner.query(`
            CREATE TABLE "suppliers" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "contactPerson" character varying(255),
                "email" character varying(255),
                "phone" character varying(50),
                "address" text,
                "taxId" character varying(100),
                "paymentTerms" text,
                "notes" text,
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_b70ac51766a9e3144f778cfe81e" PRIMARY KEY ("id")
            )
        `);

        // Create purchase_orders table
        await queryRunner.query(`
            CREATE TABLE "purchase_orders" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "orderNumber" character varying(100) NOT NULL,
                "supplierId" uuid NOT NULL,
                "status" character varying(20) NOT NULL DEFAULT 'PENDING' CHECK ("status" IN ('PENDING', 'APPROVED', 'ORDERED', 'RECEIVED', 'CANCELLED')),
                "orderDate" TIMESTAMP NOT NULL DEFAULT now(),
                "expectedDeliveryDate" TIMESTAMP,
                "actualDeliveryDate" TIMESTAMP,
                "totalAmount" decimal(12,2),
                "notes" text,
                "createdBy" uuid NOT NULL,
                "approvedBy" uuid,
                "approvedAt" TIMESTAMP,
                "receivedBy" uuid,
                "receivedAt" TIMESTAMP,
                "cancelledAt" TIMESTAMP,
                "cancelReason" text,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_f699e13af8e586de67b2f6acb0b" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_purchase_orders_order_number" UNIQUE ("orderNumber"),
                CONSTRAINT "FK_purchase_orders_supplier" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE RESTRICT,
                CONSTRAINT "FK_purchase_orders_creator" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT,
                CONSTRAINT "FK_purchase_orders_approver" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL,
                CONSTRAINT "FK_purchase_orders_receiver" FOREIGN KEY ("receivedBy") REFERENCES "users"("id") ON DELETE SET NULL
            )
        `);

        // Create purchase_order_items table
        await queryRunner.query(`
            CREATE TABLE "purchase_order_items" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "purchaseOrderId" uuid NOT NULL,
                "productId" uuid,
                "variantId" uuid,
                "productName" character varying(255) NOT NULL,
                "sku" character varying(100),
                "quantity" integer NOT NULL,
                "unitPrice" decimal(10,2) NOT NULL,
                "totalPrice" decimal(12,2) NOT NULL,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_8a01fcbc55e9b4f55e6e7d55b6b" PRIMARY KEY ("id"),
                CONSTRAINT "FK_purchase_order_items_order" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchase_orders"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_purchase_order_items_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL,
                CONSTRAINT "FK_purchase_order_items_variant" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL
            )
        `);

        // Create inventory_transactions table
        await queryRunner.query(`
            CREATE TABLE "inventory_transactions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "productId" uuid,
                "variantId" uuid,
                "quantity" integer NOT NULL,
                "transactionType" character varying(20) NOT NULL CHECK ("transactionType" IN ('PURCHASE', 'SALE', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'RETURN', 'DAMAGE')),
                "referenceId" uuid,
                "reason" character varying(500),
                "performerId" uuid NOT NULL,
                "transactionDate" TIMESTAMP NOT NULL DEFAULT now(),
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_b4e0286b7e7b2b8c1e6a0e0a2b3" PRIMARY KEY ("id"),
                CONSTRAINT "FK_inventory_transactions_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL,
                CONSTRAINT "FK_inventory_transactions_variant" FOREIGN KEY ("variantId") REFERENCES "product_variants"("id") ON DELETE SET NULL,
                CONSTRAINT "FK_inventory_transactions_performer" FOREIGN KEY ("performerId") REFERENCES "users"("id") ON DELETE RESTRICT
            )
        `);

        // Create product_tags junction table
        await queryRunner.query(`
            CREATE TABLE "product_product_tags" (
                "productId" uuid NOT NULL,
                "tagId" uuid NOT NULL,
                CONSTRAINT "PK_product_product_tags" PRIMARY KEY ("productId", "tagId"),
                CONSTRAINT "FK_product_product_tags_product" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE CASCADE,
                CONSTRAINT "FK_product_product_tags_tag" FOREIGN KEY ("tagId") REFERENCES "product_tags"("id") ON DELETE CASCADE
            )
        `);

        // Create indexes for better performance
        await queryRunner.query(`CREATE INDEX "IDX_brands_name" ON "brands" ("name")`);
        await queryRunner.query(`CREATE INDEX "IDX_categories_parent" ON "categories" ("parentId")`);
        await queryRunner.query(`CREATE INDEX "IDX_categories_active" ON "categories" ("isActive")`);
        await queryRunner.query(`CREATE INDEX "IDX_products_brand" ON "products" ("brandId")`);
        await queryRunner.query(`CREATE INDEX "IDX_products_category" ON "products" ("categoryId")`);
        await queryRunner.query(`CREATE INDEX "IDX_products_status" ON "products" ("status")`);
        await queryRunner.query(`CREATE INDEX "IDX_products_active" ON "products" ("isActive")`);
        await queryRunner.query(`CREATE INDEX "IDX_products_featured" ON "products" ("isFeatured")`);
        await queryRunner.query(`CREATE INDEX "IDX_product_variants_product" ON "product_variants" ("productId")`);
        await queryRunner.query(`CREATE INDEX "IDX_product_variants_stock" ON "product_variants" ("stockQuantity")`);
        await queryRunner.query(`CREATE INDEX "IDX_purchase_orders_supplier" ON "purchase_orders" ("supplierId")`);
        await queryRunner.query(`CREATE INDEX "IDX_purchase_orders_status" ON "purchase_orders" ("status")`);
        await queryRunner.query(`CREATE INDEX "IDX_purchase_orders_date" ON "purchase_orders" ("orderDate")`);
        await queryRunner.query(`CREATE INDEX "IDX_inventory_transactions_variant" ON "inventory_transactions" ("variantId")`);
        await queryRunner.query(`CREATE INDEX "IDX_inventory_transactions_type" ON "inventory_transactions" ("transactionType")`);
        await queryRunner.query(`CREATE INDEX "IDX_inventory_transactions_date" ON "inventory_transactions" ("transactionDate")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop tables in reverse order to handle foreign key constraints
        await queryRunner.query(`DROP TABLE "product_product_tags"`);
        await queryRunner.query(`DROP TABLE "inventory_transactions"`);
        await queryRunner.query(`DROP TABLE "purchase_order_items"`);
        await queryRunner.query(`DROP TABLE "purchase_orders"`);
        await queryRunner.query(`DROP TABLE "suppliers"`);
        await queryRunner.query(`DROP TABLE "product_attributes"`);
        await queryRunner.query(`DROP TABLE "product_variants"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TABLE "warranties"`);
        await queryRunner.query(`DROP TABLE "product_tags"`);
        await queryRunner.query(`DROP TABLE "attribute_values"`);
        await queryRunner.query(`DROP TABLE "attributes"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP TABLE "brands"`);
    }
}