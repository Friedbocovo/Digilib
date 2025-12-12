/*
  # Update schema for Google Drive links and Admin password

  ## Changes
  
  1. Create `admin_settings` table
     - Stores a single admin password for the entire system
     - is_primary indicates if this is the main password
  
  2. Modify `books` table
     - Replace `file_url` with `drive_link` to store Google Drive links
     - Both cover_url and drive_link now accept URLs
*/

CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  password_hash text NOT NULL,
  is_primary boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "No one can access admin settings"
  ON admin_settings FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'books' AND column_name = 'drive_link'
  ) THEN
    ALTER TABLE books ADD COLUMN drive_link text;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'books' AND column_name = 'file_url'
  ) THEN
    ALTER TABLE books DROP COLUMN IF EXISTS file_url;
  END IF;
END $$;

UPDATE books SET drive_link = 'https://drive.google.com/uc?export=download&id=YOUR_FILE_ID' WHERE drive_link IS NULL;

ALTER TABLE books ALTER COLUMN drive_link SET NOT NULL;
