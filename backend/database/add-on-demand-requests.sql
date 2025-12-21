-- Add on_demand_requests table for custom product requests

CREATE TABLE IF NOT EXISTS on_demand_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    customer_name VARCHAR(100),
    customer_email VARCHAR(255),
    product_name VARCHAR(255) NOT NULL,
    product_description TEXT,
    mobile_number VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    estimated_price DECIMAL(10, 2),
    payment_preference VARCHAR(50) NOT NULL,
    additional_requirements TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_on_demand_requests_user_id ON on_demand_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_on_demand_requests_status ON on_demand_requests(status);

-- Add comments for documentation
COMMENT ON TABLE on_demand_requests IS 'Stores customer requests for custom/on-demand products';
COMMENT ON COLUMN on_demand_requests.status IS 'Status values: pending, contacted, processing, fulfilled, cancelled';
COMMENT ON COLUMN on_demand_requests.payment_preference IS 'Payment preference: now or later';

COMMIT;
