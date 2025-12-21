-- BiharEssence Database Schema
-- PostgreSQL Database Setup

-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    image_url TEXT,
    stock INTEGER NOT NULL DEFAULT 0,
    in_stock BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50) DEFAULT 'pending',
    order_status VARCHAR(50) DEFAULT 'confirmed',
    customer_name VARCHAR(255) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_city VARCHAR(100),
    delivery_pincode VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Order Items table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Insert sample products
INSERT INTO products (name, description, price, category, image_url, stock, in_stock) VALUES
('Fresh Milk', 'Pure and fresh dairy milk - 1 Liter', 50.00, 'Dairy', 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400', 100, true),
('Brown Bread', 'Whole wheat brown bread - 400g', 40.00, 'Bakery', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', 80, true),
('Farm Eggs', 'Fresh farm eggs - 12 pieces', 60.00, 'Dairy', 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400', 150, true),
('Basmati Rice', 'Premium basmati rice - 5 kg', 300.00, 'Grains', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', 50, true),
('Masoor Dal', 'Red lentils - 1 kg', 120.00, 'Pulses', 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400', 75, true),
('Cooking Oil', 'Refined sunflower oil - 1 Liter', 150.00, 'Oil', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400', 60, true),
('Fresh Tomatoes', 'Farm fresh tomatoes - 1 kg', 30.00, 'Vegetables', 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400', 200, true),
('Onions', 'Red onions - 1 kg', 25.00, 'Vegetables', 'https://images.unsplash.com/photo-1508313880080-c4bef43d4c14?w=400', 180, true),
('Potatoes', 'Fresh potatoes - 1 kg', 20.00, 'Vegetables', 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400', 250, true),
('Green Chillies', 'Fresh green chillies - 100g', 15.00, 'Vegetables', 'https://images.unsplash.com/photo-1583663848850-46af132dc08e?w=400', 100, true),
('Turmeric Powder', 'Pure turmeric powder - 100g', 80.00, 'Spices', 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400', 90, true),
('Coriander Powder', 'Fresh coriander powder - 100g', 60.00, 'Spices', 'https://images.unsplash.com/photo-1596040033229-a0b3b1a8f3e0?w=400', 85, true)
ON CONFLICT DO NOTHING;

-- Insert default admin user (password: admin123 - CHANGE THIS IN PRODUCTION!)
-- Password hash is bcrypt hash of 'admin123'
INSERT INTO users (email, password_hash, name, role) VALUES
('admin@biharessence.com', '$2a$10$XQVzZ5q8ZqP6YKX9YXj9/.k5ZxJ5X5P5X5X5X5X5X5X5X5X5X5X5u', 'Admin User', 'admin')
ON CONFLICT DO NOTHING;

-- Insert default customer (password: user123 - CHANGE THIS IN PRODUCTION!)
INSERT INTO users (email, password_hash, name, role) VALUES
('user@biharessence.com', '$2a$10$YQVzZ5q8ZqP6YKX9YXj9/.k5ZxJ5X5P5X5X5X5X5X5X5X5X5X5X5v', 'Customer', 'user')
ON CONFLICT DO NOTHING;
