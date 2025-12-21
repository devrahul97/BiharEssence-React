-- Insert 200 sample products for testing infinite scroll
-- This script generates 200 Bihar-themed products

DO $$
DECLARE
    i INTEGER := 1;
    categories TEXT[] := ARRAY['Snacks', 'Dairy', 'Beverages', 'Bakery', 'Grains', 'Spices', 'Sweets', 'Vegetables', 'Fruits'];
    product_names TEXT[] := ARRAY['Litti', 'Chokha', 'Sattu', 'Khaja', 'Thekua', 'Makhana', 'Tilkut', 'Anarsa', 'Ghugni'];
    base_price INTEGER;
    random_cat TEXT;
    random_name TEXT;
BEGIN
    FOR i IN 1..200 LOOP
        -- Random category and product name
        random_cat := categories[1 + floor(random() * 9)::int];
        random_name := product_names[1 + floor(random() * 9)::int];
        base_price := 25 + floor(random() * 200)::int;
        
        INSERT INTO products (name, description, price, image, category, unit, stock, in_stock)
        VALUES (
            random_name || ' Special ' || i,
            'Authentic Bihar ' || random_name || ' - Product #' || i,
            base_price,
            'https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/images/products/sliding_image/' || (13000 + i) || 'a.jpg',
            random_cat,
            CASE 
                WHEN random() > 0.5 THEN '1 kg'
                WHEN random() > 0.5 THEN '500 g'
                ELSE '250 g'
            END,
            50 + floor(random() * 150)::int,
            true
        );
    END LOOP;
END $$;

-- Verify insertion
SELECT COUNT(*) as total_products FROM products;
SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY count DESC;
