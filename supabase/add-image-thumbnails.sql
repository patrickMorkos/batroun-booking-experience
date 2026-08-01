-- Adds a real thumbnail variant per image so admin lists/cards don't have
-- to fetch the same ~1600x1200 compressed original for a 40px preview.
-- Nullable: existing rows get backfilled by a separate one-off script;
-- new uploads populate both columns going forward.

ALTER TABLE chalet_images ADD COLUMN IF NOT EXISTS thumbnail_url text;
ALTER TABLE chalet_images ADD COLUMN IF NOT EXISTS thumbnail_storage_path text;

ALTER TABLE site_images ADD COLUMN IF NOT EXISTS thumbnail_url text;
ALTER TABLE site_images ADD COLUMN IF NOT EXISTS thumbnail_storage_path text;

ALTER TABLE gallery_media ADD COLUMN IF NOT EXISTS thumbnail_url text;
ALTER TABLE gallery_media ADD COLUMN IF NOT EXISTS thumbnail_storage_path text;

NOTIFY pgrst, 'reload schema';
