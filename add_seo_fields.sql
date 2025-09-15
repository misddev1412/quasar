-- Add SEO fields to categories table if they don't exist
DO $$
BEGIN
  -- Check if seo_title column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'seo_title'
  ) THEN
    ALTER TABLE categories ADD COLUMN seo_title VARCHAR(255);
  END IF;
  
  -- Check if seo_description column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'seo_description'
  ) THEN
    ALTER TABLE categories ADD COLUMN seo_description TEXT;
  END IF;
  
  -- Check if meta_keywords column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'meta_keywords'
  ) THEN
    ALTER TABLE categories ADD COLUMN meta_keywords TEXT;
  END IF;
END
$$;