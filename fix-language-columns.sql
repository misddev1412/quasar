-- Fix language table column names from camelCase to snake_case
-- Run this SQL directly in your database

-- Check current columns first (run this to see what needs to be changed)
-- \d languages

-- Rename columns from camelCase to snake_case
ALTER TABLE "languages" RENAME COLUMN "nativeName" TO "native_name";
ALTER TABLE "languages" RENAME COLUMN "isActive" TO "is_active"; 
ALTER TABLE "languages" RENAME COLUMN "isDefault" TO "is_default";
ALTER TABLE "languages" RENAME COLUMN "sortOrder" TO "sort_order";

-- Update indexes to use the new column names
DROP INDEX IF EXISTS "IDX_LANGUAGE_ACTIVE";
DROP INDEX IF EXISTS "IDX_LANGUAGE_DEFAULT";  
DROP INDEX IF EXISTS "IDX_LANGUAGE_SORT_ORDER";

-- Create new indexes with correct column names
CREATE INDEX "IDX_LANGUAGE_ACTIVE" ON "languages" ("is_active");
CREATE INDEX "IDX_LANGUAGE_DEFAULT" ON "languages" ("is_default");
CREATE INDEX "IDX_LANGUAGE_SORT_ORDER" ON "languages" ("sort_order");

-- Verify the changes
-- \d languages