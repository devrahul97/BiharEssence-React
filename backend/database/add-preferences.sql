-- Add theme and language columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS theme VARCHAR(20) DEFAULT 'light',
ADD COLUMN IF NOT EXISTS language VARCHAR(20) DEFAULT 'en';

-- Update existing users to have default preferences
UPDATE users 
SET theme = 'light', language = 'en'
WHERE theme IS NULL OR language IS NULL;
