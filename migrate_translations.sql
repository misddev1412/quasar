-- Migration Script: Move translatable fields from categories to category_translations
-- Execute these commands in order

-- Step 1: Add new columns to category_translations table
DO $$
BEGIN
  -- Check if slug column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'category_translations' AND column_name = 'slug'
  ) THEN
    ALTER TABLE category_translations ADD COLUMN slug VARCHAR(255);
  END IF;
  
  -- Check if seo_title column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'category_translations' AND column_name = 'seo_title'
  ) THEN
    ALTER TABLE category_translations ADD COLUMN seo_title VARCHAR(255);
  END IF;
  
  -- Check if seo_description column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'category_translations' AND column_name = 'seo_description'
  ) THEN
    ALTER TABLE category_translations ADD COLUMN seo_description TEXT;
  END IF;
  
  -- Check if meta_keywords column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'category_translations' AND column_name = 'meta_keywords'
  ) THEN
    ALTER TABLE category_translations ADD COLUMN meta_keywords TEXT;
  END IF;
END
$$;

-- Step 2: Migrate existing data from categories to category_translations
DO $$
DECLARE
    category_record RECORD;
BEGIN
    -- Loop through all categories with translatable data
    FOR category_record IN 
        SELECT id, name, description, slug, seo_title, seo_description, meta_keywords 
        FROM categories 
        WHERE name IS NOT NULL OR description IS NOT NULL OR slug IS NOT NULL 
           OR seo_title IS NOT NULL OR seo_description IS NOT NULL OR meta_keywords IS NOT NULL
    LOOP
        -- Check if translation already exists for 'en' locale
        IF NOT EXISTS (
            SELECT 1 FROM category_translations 
            WHERE category_id = category_record.id AND locale = 'en'
        ) THEN
            -- Create new translation with all fields
            INSERT INTO category_translations (
                category_id, locale, name, description, slug, 
                seo_title, seo_description, meta_keywords,
                created_at, updated_at, version, created_by, updated_by
            )
            VALUES (
                category_record.id, 'en', 
                category_record.name, category_record.description, category_record.slug,
                category_record.seo_title, category_record.seo_description, category_record.meta_keywords,
                CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, NULL, NULL
            );
        ELSE
            -- Update existing translation with new fields
            UPDATE category_translations 
            SET slug = category_record.slug,
                seo_title = category_record.seo_title,
                seo_description = category_record.seo_description,
                meta_keywords = category_record.meta_keywords,
                updated_at = CURRENT_TIMESTAMP,
                version = version + 1
            WHERE category_id = category_record.id AND locale = 'en';
        END IF;
    END LOOP;
END
$$;

-- Step 3: Remove translatable fields from categories table
-- Note: We keep 'name' and 'description' in categories for fallback display
DO $$
BEGIN
  -- Drop unique constraint on slug first (if it exists)
  BEGIN
    EXECUTE 'ALTER TABLE categories DROP CONSTRAINT IF EXISTS UQ_categories_slug';
  EXCEPTION
    WHEN others THEN
      -- Constraint might not exist, ignore error
      NULL;
  END;
  
  -- Drop index on slug if it exists
  BEGIN
    EXECUTE 'DROP INDEX IF EXISTS IDX_categories_slug';
  EXCEPTION
    WHEN others THEN
      -- Index might not exist, ignore error
      NULL;
  END;

  -- Drop columns if they exist
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'slug'
  ) THEN
    ALTER TABLE categories DROP COLUMN slug;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'seo_title'
  ) THEN
    ALTER TABLE categories DROP COLUMN seo_title;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'seo_description'
  ) THEN
    ALTER TABLE categories DROP COLUMN seo_description;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'meta_keywords'
  ) THEN
    ALTER TABLE categories DROP COLUMN meta_keywords;
  END IF;
END
$$;

-- Step 4: Verify migration
SELECT 'Migration completed successfully!' as status;

-- Check category_translations structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'category_translations' 
ORDER BY ordinal_position;

-- Check categories structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'categories' 
ORDER BY ordinal_position;