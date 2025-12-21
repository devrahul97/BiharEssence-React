import { API_ENDPOINTS } from './constants.js';

// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json'
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
};

// Fetch all products from backend with pagination
export const fetchProducts = async (page = 1, limit = 8) => {
    try {
        const response = await fetch(`${API_ENDPOINTS.PRODUCTS}?page=${page}&limit=${limit}`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch products');
        }
        
        // Calculate hasMore from pagination data
        const hasMore = data.pagination && data.pagination.page < data.pagination.pages;
        
        return {
            products: data.products,
            hasMore: hasMore,
            total: data.pagination?.total || data.products.length
        };
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
};

// Fetch single product
export const fetchProduct = async (id) => {
    try {
        const response = await fetch(`${API_ENDPOINTS.PRODUCTS}/${id}`);
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch product');
        }
        
        return data.product;
    } catch (error) {
        console.error('Error fetching product:', error);
        throw error;
    }
};

// Create order and update inventory
export const createOrder = async (orderData) => {
    try {
        const response = await fetch(API_ENDPOINTS.ORDERS, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(orderData),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error('Please login to place an order');
            }
            throw new Error(data.message || data.error || 'Failed to create order');
        }
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to create order');
        }
        
        return data;
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
};

// Fetch all orders
export const fetchOrders = async () => {
    try {
        const response = await fetch(API_ENDPOINTS.ORDERS, {
            headers: getAuthHeaders()
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                throw new Error('Please login to view orders');
            }
            throw new Error(data.message || data.error || 'Failed to fetch orders');
        }
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to fetch orders');
        }
        
        return data.orders;
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
};

// Update product stock (for warehouse management)
export const updateProductStock = async (productId, newStock) => {
    try {
        const response = await fetch(`${API_ENDPOINTS.PRODUCTS}/${productId}/stock`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ stock: newStock }),
        });
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.message || 'Failed to update stock');
        }
        
        return data.product;
    } catch (error) {
        console.error('Error updating stock:', error);
        throw error;
    }
};
