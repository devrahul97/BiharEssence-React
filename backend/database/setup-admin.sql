-- Add role column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'customer';

-- Create index for role queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Insert admin user with hashed password for 'admin'
-- Password: admin (hashed with bcrypt)
INSERT INTO users (name, email, password, phone, role) 
VALUES (
    'Admin User', 
    'rahul@gmail.com', 
    '$2b$10$n4j/gsVtbe03JhihiwYK1.hxRUPoyppL1MByAZWycK0P..MGONt8u',
    '9876543210',
    'admin'
)
ON CONFLICT (email) DO UPDATE SET role = 'admin', password = '$2b$10$n4j/gsVtbe03JhihiwYK1.hxRUPoyppL1MByAZWycK0P..MGONt8u';

-- Update existing users to have customer role if null
UPDATE users SET role = 'customer' WHERE role IS NULL;

COMMIT;
