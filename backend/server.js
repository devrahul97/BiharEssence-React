const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database file path (using JSON file as simple database)
const DB_PATH = path.join(__dirname, 'database', 'inventory.json');
const ORDERS_PATH = path.join(__dirname, 'database', 'orders.json');

// Initialize database
const initializeDatabase = async () => {
    try {
        await fs.mkdir(path.join(__dirname, 'database'), { recursive: true });
        
        // Check if inventory exists, if not create it
        try {
            await fs.access(DB_PATH);
        } catch {
            const initialInventory = {
                products: [
                    {
                        id: "1",
                        name: "Fresh Milk",
                        description: "Amul Taaza Toned Fresh Milk",
                        price: 54,
                        image: "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/images/products/sliding_image/13274a.jpg",
                        category: "Dairy",
                        unit: "1 L",
                        stock: 100,
                        inStock: true
                    },
                    {
                        id: "2",
                        name: "Brown Bread",
                        description: "Britannia Whole Wheat Bread",
                        price: 45,
                        image: "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/images/products/sliding_image/40058a.jpg",
                        category: "Bakery",
                        unit: "400 g",
                        stock: 80,
                        inStock: true
                    },
                    {
                        id: "3",
                        name: "Fresh Eggs",
                        description: "Farm Fresh White Eggs",
                        price: 84,
                        image: "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/images/products/sliding_image/90026a.jpg",
                        category: "Eggs",
                        unit: "6 pieces",
                        stock: 150,
                        inStock: true
                    },
                    {
                        id: "4",
                        name: "Basmati Rice",
                        description: "India Gate Basmati Rice",
                        price: 220,
                        image: "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/images/products/sliding_image/10491a.jpg",
                        category: "Rice & Flour",
                        unit: "1 kg",
                        stock: 50,
                        inStock: true
                    },
                    {
                        id: "5",
                        name: "Bananas",
                        description: "Fresh Yellow Bananas",
                        price: 50,
                        image: "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/images/products/sliding_image/10000029a.jpg",
                        category: "Fruits",
                        unit: "6 pieces",
                        stock: 200,
                        inStock: true
                    },
                    {
                        id: "6",
                        name: "Tomatoes",
                        description: "Fresh Red Tomatoes",
                        price: 30,
                        image: "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/images/products/sliding_image/10000143a.jpg",
                        category: "Vegetables",
                        unit: "500 g",
                        stock: 180,
                        inStock: true
                    },
                    {
                        id: "7",
                        name: "Coca Cola",
                        description: "Coca Cola Soft Drink",
                        price: 40,
                        image: "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/images/products/sliding_image/387277a.jpg",
                        category: "Beverages",
                        unit: "750 ml",
                        stock: 120,
                        inStock: true
                    },
                    {
                        id: "8",
                        name: "Maggi Noodles",
                        description: "Nestle Maggi Masala Noodles",
                        price: 14,
                        image: "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/images/products/sliding_image/1275a.jpg",
                        category: "Instant Food",
                        unit: "70 g",
                        stock: 300,
                        inStock: true
                    },
                    {
                        id: "9",
                        name: "Potato Chips",
                        description: "Lay's Classic Salted Chips",
                        price: 20,
                        image: "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/images/products/sliding_image/483689a.jpg",
                        category: "Snacks",
                        unit: "52 g",
                        stock: 250,
                        inStock: true
                    },
                    {
                        id: "10",
                        name: "Toor Dal",
                        description: "Tata Sampann Toor Dal",
                        price: 150,
                        image: "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/images/products/sliding_image/486643a.jpg",
                        category: "Dal & Pulses",
                        unit: "1 kg",
                        stock: 70,
                        inStock: true
                    },
                    {
                        id: "11",
                        name: "Atta",
                        description: "Aashirvaad Whole Wheat Atta",
                        price: 280,
                        image: "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/images/products/sliding_image/17420a.jpg",
                        category: "Rice & Flour",
                        unit: "5 kg",
                        stock: 60,
                        inStock: true
                    },
                    {
                        id: "12",
                        name: "Paneer",
                        description: "Amul Fresh Paneer",
                        price: 90,
                        image: "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=270/app/images/products/sliding_image/13264a.jpg",
                        category: "Dairy",
                        unit: "200 g",
                        stock: 90,
                        inStock: true
                    }
                ]
            };
            await fs.writeFile(DB_PATH, JSON.stringify(initialInventory, null, 2));
        }

        // Check if orders file exists
        try {
            await fs.access(ORDERS_PATH);
        } catch {
            await fs.writeFile(ORDERS_PATH, JSON.stringify({ orders: [] }, null, 2));
        }

        console.log('✅ Database initialized successfully');
    } catch (error) {
        console.error('❌ Error initializing database:', error);
    }
};

// Helper functions
const readDatabase = async () => {
    const data = await fs.readFile(DB_PATH, 'utf8');
    return JSON.parse(data);
};

const writeDatabase = async (data) => {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
};

const readOrders = async () => {
    const data = await fs.readFile(ORDERS_PATH, 'utf8');
    return JSON.parse(data);
};

const writeOrders = async (data) => {
    await fs.writeFile(ORDERS_PATH, JSON.stringify(data, null, 2));
};

// ==================== API ROUTES ====================

// Get all products with current stock (with pagination)
app.get('/api/products', async (req, res) => {
    try {
        const db = await readDatabase();
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 8;
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const paginatedProducts = db.products.slice(startIndex, endIndex);
        const hasMore = endIndex < db.products.length;

        res.json({ 
            success: true, 
            products: paginatedProducts,
            hasMore,
            total: db.products.length,
            page,
            totalPages: Math.ceil(db.products.length / limit)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching products', error: error.message });
    }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
    try {
        const db = await readDatabase();
        const product = db.products.find(p => p.id === req.params.id);
        
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        
        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching product', error: error.message });
    }
});

// Create order and update inventory
app.post('/api/orders', async (req, res) => {
    try {
        const { items, customerInfo, paymentMethod, totalAmount } = req.body;
        
        // Validate request
        if (!items || !customerInfo || !paymentMethod) {
            return res.status(400).json({ success: false, message: 'Missing required fields' });
        }

        const db = await readDatabase();
        const ordersDb = await readOrders();

        // Check stock availability for all items
        const stockIssues = [];
        for (const item of items) {
            const product = db.products.find(p => p.id === item.id);
            if (!product) {
                stockIssues.push(`Product ${item.name} not found`);
            } else if (product.stock < item.quantity) {
                stockIssues.push(`Insufficient stock for ${item.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
            }
        }

        if (stockIssues.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Stock unavailable', 
                issues: stockIssues 
            });
        }

        // Update inventory (decrease stock)
        for (const item of items) {
            const product = db.products.find(p => p.id === item.id);
            product.stock -= item.quantity;
            product.inStock = product.stock > 0;
        }

        // Save updated inventory
        await writeDatabase(db);

        // Create order
        const order = {
            orderId: `ORD${Date.now()}`,
            items,
            customerInfo,
            paymentMethod,
            totalAmount,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        ordersDb.orders.push(order);
        await writeOrders(ordersDb);

        res.json({ 
            success: true, 
            message: 'Order placed successfully',
            order,
            updatedProducts: db.products.filter(p => items.some(item => item.id === p.id))
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating order', error: error.message });
    }
});

// Get all orders
app.get('/api/orders', async (req, res) => {
    try {
        const ordersDb = await readOrders();
        res.json({ success: true, orders: ordersDb.orders });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching orders', error: error.message });
    }
});

// Update product stock (for warehouse management)
app.patch('/api/products/:id/stock', async (req, res) => {
    try {
        const { stock } = req.body;
        
        if (typeof stock !== 'number' || stock < 0) {
            return res.status(400).json({ success: false, message: 'Invalid stock value' });
        }

        const db = await readDatabase();
        const product = db.products.find(p => p.id === req.params.id);
        
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        product.stock = stock;
        product.inStock = stock > 0;
        
        await writeDatabase(db);
        
        res.json({ success: true, message: 'Stock updated', product });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating stock', error: error.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
const startServer = async () => {
    await initializeDatabase();
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📦 Products API: http://localhost:${PORT}/api/products`);
        console.log(`🛒 Orders API: http://localhost:${PORT}/api/orders`);
    });
};

startServer();
