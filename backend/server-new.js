const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Database connection - works for both local and production
const pool = new Pool(
    process.env.DATABASE_URL
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl: {
                rejectUnauthorized: false
            }
        }
        : {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 5432,
            database: process.env.DB_NAME || 'biharessence',
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || 'root',
        }
);

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Error connecting to database:', err.stack);
    } else {
        console.log('✅ Database connected successfully');
        console.log('🌍 Environment:', process.env.NODE_ENV || 'development');
        console.log('📍 Database:', process.env.DATABASE_URL ? 'Cloud (Neon)' : 'Local');
        release();
    }
});

// Middleware
app.use(cors({
    origin: [
        'http://localhost:1234',
        'http://localhost:3000',
        process.env.FRONTEND_URL || ''
    ].filter(Boolean),
    credentials: true
}));
app.use(express.json());

// JWT Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// ==================== AUTH ROUTES ====================

// User Registration
app.post('/api/auth/signup', async (req, res) => {
    const { name, email, password, phone } = req.body;

    try {
        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required' });
        }

        // Check if user already exists
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists with this email' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        const result = await pool.query(
            'INSERT INTO users (name, email, password, phone) VALUES ($1, $2, $3, $4) RETURNING id, name, email, phone, created_at',
            [name, email, hashedPassword, phone || null]
        );

        const user = result.rows[0];

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name, role: 'customer' },
            process.env.JWT_SECRET || 'your_secret_key',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                theme: user.theme || 'light',
                language: user.language || 'en',
                role: 'customer'
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Server error during registration' });
    }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = result.rows[0];

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name, role: user.role || 'customer' },
            process.env.JWT_SECRET || 'your_secret_key',
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                theme: user.theme || 'light',
                language: user.language || 'en',
                role: user.role || 'customer'
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// Get Current User
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, email, phone, theme, language, created_at FROM users WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ success: true, user: result.rows[0] });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update User Preferences (theme, language)
app.patch('/api/auth/preferences', authenticateToken, async (req, res) => {
    const { theme, language } = req.body;

    try {
        const updates = [];
        const params = [];
        let paramCount = 1;

        if (theme !== undefined) {
            updates.push(`theme = $${paramCount}`);
            params.push(theme);
            paramCount++;
        }

        if (language !== undefined) {
            updates.push(`language = $${paramCount}`);
            params.push(language);
            paramCount++;
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No preferences to update' });
        }

        params.push(req.user.id);
        const query = `UPDATE users SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING id, name, email, phone, theme, language`;
        
        const result = await pool.query(query, params);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ 
            success: true, 
            message: 'Preferences updated successfully',
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Update preferences error:', error);
        res.status(500).json({ error: 'Server error updating preferences' });
    }
});

// ==================== PRODUCTS ROUTES ====================

// Get all products with pagination
app.get('/api/products', async (req, res) => {
    const { page = 1, limit = 20, category, search } = req.query;
    const offset = (page - 1) * limit;

    try {
        let query = 'SELECT * FROM products WHERE 1=1';
        const params = [];
        let paramCount = 1;

        if (category && category !== 'all') {
            query += ` AND category = $${paramCount}`;
            params.push(category);
            paramCount++;
        }

        if (search) {
            query += ` AND (name ILIKE $${paramCount} OR description ILIKE $${paramCount})`;
            params.push(`%${search}%`);
            paramCount++;
        }

        query += ' ORDER BY id';
        query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);

        // Get total count
        let countQuery = 'SELECT COUNT(*) FROM products WHERE 1=1';
        const countParams = [];
        let countParamCount = 1;

        if (category && category !== 'all') {
            countQuery += ` AND category = $${countParamCount}`;
            countParams.push(category);
            countParamCount++;
        }

        if (search) {
            countQuery += ` AND (name ILIKE $${countParamCount} OR description ILIKE $${countParamCount})`;
            countParams.push(`%${search}%`);
        }

        const countResult = await pool.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].count);

        res.json({
            success: true,
            products: result.rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Server error fetching products' });
    }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ success: true, product: result.rows[0] });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get product categories
app.get('/api/products/categories/all', async (req, res) => {
    try {
        const result = await pool.query('SELECT DISTINCT category FROM products ORDER BY category');
        const categories = result.rows.map(row => row.category);
        res.json({ success: true, categories });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== ORDERS ROUTES ====================

// Create new order
app.post('/api/orders', authenticateToken, async (req, res) => {
    const { items, customerInfo, paymentMethod, totalAmount, subtotal, deliveryFee } = req.body;
    const userId = req.user.id;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Generate order ID
        const orderId = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

        // Insert order
        const orderResult = await client.query(
            `INSERT INTO orders 
            (order_id, user_id, customer_name, customer_email, customer_phone, customer_address, customer_city, customer_pincode, payment_method, subtotal, delivery_fee, total_amount, status) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
            RETURNING *`,
            [
                orderId,
                userId,
                customerInfo.name,
                customerInfo.email,
                customerInfo.phone,
                customerInfo.address,
                customerInfo.city,
                customerInfo.pincode,
                paymentMethod,
                subtotal,
                deliveryFee,
                totalAmount,
                'confirmed'
            ]
        );

        const order = orderResult.rows[0];

        // Insert order items
        for (const item of items) {
            await client.query(
                `INSERT INTO order_items 
                (order_id, product_id, product_name, product_price, quantity, total) 
                VALUES ($1, $2, $3, $4, $5, $6)`,
                [order.id, item.id, item.name, item.price, item.quantity, item.price * item.quantity]
            );

            // Update product stock
            await client.query(
                'UPDATE products SET stock = stock - $1 WHERE id = $2',
                [item.quantity, item.id]
            );
        }

        await client.query('COMMIT');

        res.status(201).json({
            success: true,
            message: 'Order created successfully',
            order: {
                orderId: order.order_id,
                id: order.id,
                totalAmount: order.total_amount,
                status: order.status
            }
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Server error creating order' });
    } finally {
        client.release();
    }
});

// Get user's orders
app.get('/api/orders', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const ordersResult = await pool.query(
            `SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
            [userId]
        );

        const orders = ordersResult.rows;

        // Get items for each order and transform data
        for (let order of orders) {
            const itemsResult = await pool.query(
                'SELECT * FROM order_items WHERE order_id = $1',
                [order.id]
            );
            
            // Transform snake_case to camelCase for frontend
            order.orderId = order.order_id;
            order.userId = order.user_id;
            order.customerInfo = {
                name: order.customer_name,
                email: order.customer_email,
                phone: order.customer_phone,
                address: order.customer_address,
                city: order.customer_city,
                pincode: order.customer_pincode
            };
            order.paymentMethod = order.payment_method;
            order.totalAmount = parseFloat(order.total_amount);
            order.subtotal = parseFloat(order.subtotal);
            order.deliveryFee = parseFloat(order.delivery_fee || 0);
            order.createdAt = order.created_at;
            order.updatedAt = order.updated_at;
            
            // Transform order items
            order.items = itemsResult.rows.map(item => ({
                id: item.id,
                productId: item.product_id,
                name: item.product_name,
                price: parseFloat(item.product_price),
                quantity: item.quantity,
                total: parseFloat(item.total)
            }));
            
            // Clean up snake_case fields
            delete order.order_id;
            delete order.user_id;
            delete order.customer_name;
            delete order.customer_email;
            delete order.customer_phone;
            delete order.customer_address;
            delete order.customer_city;
            delete order.customer_pincode;
            delete order.payment_method;
            delete order.total_amount;
            delete order.delivery_fee;
            delete order.created_at;
            delete order.updated_at;
        }

        res.json({ success: true, orders });
    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({ error: 'Server error fetching orders' });
    }
});

// Get single order
app.get('/api/orders/:orderId', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { orderId } = req.params;

    try {
        const orderResult = await pool.query(
            'SELECT * FROM orders WHERE order_id = $1 AND user_id = $2',
            [orderId, userId]
        );

        if (orderResult.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const order = orderResult.rows[0];

        // Get order items
        const itemsResult = await pool.query(
            'SELECT * FROM order_items WHERE order_id = $1',
            [order.id]
        );

        order.items = itemsResult.rows;

        res.json({ success: true, order });
    } catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Submit on-demand product request
app.post('/api/orders/on-demand-request', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const {
        customerName,
        customerEmail,
        productName,
        productDescription,
        mobileNumber,
        address,
        estimatedPrice,
        paymentPreference,
        additionalRequirements
    } = req.body;

    try {
        // Validate required fields
        if (!productName || !mobileNumber || !address || !paymentPreference) {
            return res.status(400).json({ error: 'Product name, mobile number, address, and payment preference are required' });
        }

        // Insert request into database
        const result = await pool.query(
            `INSERT INTO on_demand_requests 
            (user_id, customer_name, customer_email, product_name, product_description, 
             mobile_number, address, estimated_price, payment_preference, additional_requirements, status) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending') 
            RETURNING *`,
            [
                userId,
                customerName,
                customerEmail,
                productName,
                productDescription || null,
                mobileNumber,
                address,
                estimatedPrice || null,
                paymentPreference,
                additionalRequirements || null
            ]
        );

        res.status(201).json({
            success: true,
            message: 'On-demand request submitted successfully. Admin will contact you soon.',
            request: result.rows[0]
        });
    } catch (error) {
        console.error('On-demand request error:', error);
        res.status(500).json({ error: 'Server error submitting request' });
    }
});

// Get user's on-demand requests
app.get('/api/orders/on-demand-requests', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await pool.query(
            `SELECT * FROM on_demand_requests WHERE user_id = $1 ORDER BY created_at DESC`,
            [userId]
        );

        res.json({ success: true, requests: result.rows });
    } catch (error) {
        console.error('Get on-demand requests error:', error);
        res.status(500).json({ error: 'Server error fetching requests' });
    }
});

// Admin: Get all on-demand requests
app.get('/api/admin/on-demand-requests', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT odr.*, u.name as user_name, u.email as user_email 
             FROM on_demand_requests odr 
             LEFT JOIN users u ON odr.user_id = u.id 
             ORDER BY odr.created_at DESC`
        );

        res.json({ success: true, requests: result.rows });
    } catch (error) {
        console.error('Get all on-demand requests error:', error);
        res.status(500).json({ error: 'Server error fetching requests' });
    }
});

// Admin: Update on-demand request status
app.patch('/api/admin/on-demand-requests/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    try {
        const result = await pool.query(
            `UPDATE on_demand_requests 
             SET status = $1, admin_notes = $2, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $3 
             RETURNING *`,
            [status, adminNotes || null, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Request not found' });
        }

        res.json({
            success: true,
            message: 'Request updated successfully',
            request: result.rows[0]
        });
    } catch (error) {
        console.error('Update on-demand request error:', error);
        res.status(500).json({ error: 'Server error updating request' });
    }
});

// ==================== ADMIN ROUTES ====================

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin only.' });
    }
    next();
};

// Get all products (admin) with pagination
app.get('/api/admin/products', authenticateToken, isAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;

        // Get total count
        const countResult = await pool.query('SELECT COUNT(*) FROM products');
        const total = parseInt(countResult.rows[0].count);
        const pages = Math.ceil(total / limit);

        // Get paginated products
        const result = await pool.query(
            'SELECT * FROM products ORDER BY created_at DESC LIMIT $1 OFFSET $2',
            [limit, offset]
        );

        res.json({ 
            success: true, 
            products: result.rows,
            pagination: {
                page,
                limit,
                total,
                pages
            }
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add new product
app.post('/api/admin/products', authenticateToken, isAdmin, async (req, res) => {
    const { name, description, price, category, image, unit, in_stock, stock } = req.body;

    try {
        if (!name || !price || !category) {
            return res.status(400).json({ error: 'Name, price, and category are required' });
        }

        const result = await pool.query(
            'INSERT INTO products (name, description, price, category, image, unit, in_stock, stock) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [name, description || '', price, category, image || '', unit || 'piece', in_stock !== false, stock || 0]
        );

        res.status(201).json({ success: true, message: 'Product added successfully', product: result.rows[0] });
    } catch (error) {
        console.error('Add product error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update product
app.put('/api/admin/products/:id', authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, description, price, category, image, unit, in_stock, stock } = req.body;

    try {
        const result = await pool.query(
            'UPDATE products SET name = $1, description = $2, price = $3, category = $4, image = $5, unit = $6, in_stock = $7, stock = $8, updated_at = CURRENT_TIMESTAMP WHERE id = $9 RETURNING *',
            [name, description, price, category, image, unit, in_stock, stock, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ success: true, message: 'Product updated successfully', product: result.rows[0] });
    } catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete product
app.delete('/api/admin/products/:id', authenticateToken, isAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all orders (admin)
app.get('/api/admin/orders', authenticateToken, isAdmin, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
        res.json({ success: true, orders: result.rows, total: result.rows.length });
    } catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// ==================== ADDRESS MANAGEMENT ROUTES ====================

// Get all addresses for current user
app.get('/api/addresses', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM user_addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
            [req.user.id]
        );
        res.json({ success: true, addresses: result.rows });
    } catch (error) {
        console.error('Get addresses error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add new address
app.post('/api/addresses', authenticateToken, async (req, res) => {
    const { label, name, phone, address, city, pincode, is_default } = req.body;

    try {
        // Validate required fields
        if (!name || !phone || !address || !city || !pincode) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Validate phone (10 digits)
        if (!/^\d{10}$/.test(phone)) {
            return res.status(400).json({ error: 'Phone must be exactly 10 digits' });
        }

        // Validate pincode (6 digits)
        if (!/^\d{6}$/.test(pincode)) {
            return res.status(400).json({ error: 'Pincode must be exactly 6 digits' });
        }

        const result = await pool.query(
            'INSERT INTO user_addresses (user_id, label, name, phone, address, city, pincode, is_default) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [req.user.id, label || 'Home', name, phone, address, city, pincode, is_default || false]
        );

        res.status(201).json({ success: true, message: 'Address added successfully', address: result.rows[0] });
    } catch (error) {
        console.error('Add address error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update address
app.put('/api/addresses/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { label, name, phone, address, city, pincode, is_default } = req.body;

    try {
        // Verify address belongs to user
        const checkResult = await pool.query(
            'SELECT * FROM user_addresses WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Address not found' });
        }

        // Validate phone and pincode if provided
        if (phone && !/^\d{10}$/.test(phone)) {
            return res.status(400).json({ error: 'Phone must be exactly 10 digits' });
        }
        if (pincode && !/^\d{6}$/.test(pincode)) {
            return res.status(400).json({ error: 'Pincode must be exactly 6 digits' });
        }

        const result = await pool.query(
            'UPDATE user_addresses SET label = $1, name = $2, phone = $3, address = $4, city = $5, pincode = $6, is_default = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8 AND user_id = $9 RETURNING *',
            [label, name, phone, address, city, pincode, is_default, id, req.user.id]
        );

        res.json({ success: true, message: 'Address updated successfully', address: result.rows[0] });
    } catch (error) {
        console.error('Update address error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Set default address
app.patch('/api/addresses/:id/default', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        // Verify address belongs to user
        const checkResult = await pool.query(
            'SELECT * FROM user_addresses WHERE id = $1 AND user_id = $2',
            [id, req.user.id]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({ error: 'Address not found' });
        }

        // Update address to default (trigger will handle unsetting others)
        const result = await pool.query(
            'UPDATE user_addresses SET is_default = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, req.user.id]
        );

        res.json({ success: true, message: 'Default address updated', address: result.rows[0] });
    } catch (error) {
        console.error('Set default address error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete address
app.delete('/api/addresses/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM user_addresses WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Address not found' });
        }

        res.json({ success: true, message: 'Address deleted successfully' });
    } catch (error) {
        console.error('Delete address error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Database: ${process.env.DB_NAME || 'biharessence'}`);
});
