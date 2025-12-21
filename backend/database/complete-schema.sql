-- BiharEssence Complete Database Schema

-- Drop existing tables if they exist
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS products CASCADE;

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    theme VARCHAR(20) DEFAULT 'light',
    language VARCHAR(20) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products Table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    image VARCHAR(500),
    unit VARCHAR(50),
    in_stock BOOLEAN DEFAULT true,
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address TEXT NOT NULL,
    customer_city VARCHAR(100) NOT NULL,
    customer_pincode VARCHAR(10) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    product_price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_order_id ON orders(order_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- Insert sample products
INSERT INTO products (name, description, price, category, image, unit, in_stock, stock) VALUES
('Litti Chokha Mix', 'Traditional Bihar delicacy ready-mix', 150, 'Food', 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=400', '500g pack', true, 50),
('Sattu Powder', 'Pure roasted gram flour from Bihar', 120, 'Food', 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400', '1kg pack', true, 100),
('Madhubani Painting', 'Authentic handcrafted Madhubani art', 899, 'Art', 'https://images.unsplash.com/photo-1582201957195-be1f8c50e99e?w=400', 'Medium size', true, 20),
('Khaja Sweet', 'Famous Silao Khaja from Nalanda', 200, 'Sweets', 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400', '500g box', true, 75),
('Bihar Honey', 'Pure natural honey from Bihar farms', 350, 'Food', 'https://images.unsplash.com/photo-1587049352846-4a222e784422?w=400', '500ml bottle', true, 40),
('Sikki Craft Items', 'Traditional Sikki grass craft', 450, 'Handicraft', 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400', 'Set of 3', true, 30),
('Anarsa (Sweet)', 'Traditional Bihar sweet made with rice', 180, 'Sweets', 'https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=400', '250g pack', true, 60),
('Makhana (Fox Nuts)', 'Premium quality Makhana from Darbhanga', 280, 'Dry Fruits', 'https://images.unsplash.com/photo-1612790401534-c43c61489e15?w=400', '500g pack', true, 90),
('Chura (Flattened Rice)', 'Fresh poha/chura from local mills', 80, 'Food', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', '1kg pack', true, 120),
('Tilkut', 'Sesame and jaggery sweet from Bihar', 160, 'Sweets', 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400', '500g box', true, 55);

-- Insert more products to reach 50
INSERT INTO products (name, description, price, category, image, unit, in_stock, stock) VALUES
('Bihari Pickles Combo', 'Assorted traditional pickles', 320, 'Food', 'https://images.unsplash.com/photo-1600803907087-f56d462fd26b?w=400', '3x200g jars', true, 45),
('Khesari Dal', 'Traditional Bihar lentil', 95, 'Food', 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400', '1kg', true, 80),
('Thekua', 'Chhath puja special sweet', 140, 'Sweets', 'https://images.unsplash.com/photo-1603532648955-039310d9ed75?w=400', '500g', true, 65),
('Bamboo Craft', 'Handmade bamboo items', 550, 'Handicraft', 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400', 'Set', true, 25),
('Bihar Masala Tea', 'Special blend tea powder', 180, 'Beverages', 'https://images.unsplash.com/photo-1597318236569-b5eb8e6c2e2e?w=400', '250g', true, 70);

COMMIT;
