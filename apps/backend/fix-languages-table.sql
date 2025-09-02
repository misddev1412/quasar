-- Fix languages table with correct column names

-- Drop the table if it exists with wrong column names
DROP TABLE IF EXISTS "languages";

-- Create the languages table with correct snake_case column names to match BaseEntity
CREATE TABLE "languages" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "code" varchar(10) NOT NULL UNIQUE,
  "name" varchar(100) NOT NULL,
  "native_name" varchar(100) NOT NULL,
  "icon" varchar(10),
  "is_active" boolean NOT NULL DEFAULT true,
  "is_default" boolean NOT NULL DEFAULT false,
  "sort_order" int NOT NULL DEFAULT 0,
  "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deleted_at" timestamp,
  "version" int NOT NULL DEFAULT 1,
  "created_by" uuid,
  "updated_by" uuid,
  "deleted_by" uuid,
  CONSTRAINT "PK_languages" PRIMARY KEY ("id")
);

-- Create indexes
CREATE UNIQUE INDEX "IDX_LANGUAGE_CODE" ON "languages" ("code");
CREATE INDEX "IDX_LANGUAGE_ACTIVE" ON "languages" ("is_active");
CREATE INDEX "IDX_LANGUAGE_DEFAULT" ON "languages" ("is_default");
CREATE INDEX "IDX_LANGUAGE_SORT_ORDER" ON "languages" ("sort_order");

-- Insert initial language data
INSERT INTO "languages" ("code", "name", "native_name", "icon", "is_active", "is_default", "sort_order") VALUES
('en', 'English', 'English', '🇺🇸', true, true, 1),
('vi', 'Vietnamese', 'Tiếng Việt', '🇻🇳', true, false, 2),
('fr', 'French', 'Français', '🇫🇷', false, false, 3),
('de', 'German', 'Deutsch', '🇩🇪', false, false, 4),
('es', 'Spanish', 'Español', '🇪🇸', false, false, 5),
('it', 'Italian', 'Italiano', '🇮🇹', false, false, 6),
('pt', 'Portuguese', 'Português', '🇵🇹', false, false, 7),
('ja', 'Japanese', '日本語', '🇯🇵', false, false, 8),
('ko', 'Korean', '한국어', '🇰🇷', false, false, 9),
('zh', 'Chinese', '中文', '🇨🇳', false, false, 10),
('ru', 'Russian', 'Русский', '🇷🇺', false, false, 11),
('ar', 'Arabic', 'العربية', '🇸🇦', false, false, 12),
('hi', 'Hindi', 'हिन्दी', '🇮🇳', false, false, 13),
('th', 'Thai', 'ไทย', '🇹🇭', false, false, 14),
('id', 'Indonesian', 'Bahasa Indonesia', '🇮🇩', false, false, 15);