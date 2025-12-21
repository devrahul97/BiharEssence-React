import { API_ENDPOINTS } from './constants.js';

export const fetchOrders = async () => {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(API_ENDPOINTS.ORDERS, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        
        // Handle error responses
        if (!response.ok) {
            throw new Error(data.error || data.message || 'Failed to fetch orders');
        }
        
        if (data.success) {
            return data.orders;
        }
        throw new Error(data.message || 'Failed to fetch orders');
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
};
