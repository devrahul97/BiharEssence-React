import { API_ENDPOINTS } from './constants.js';

export const updateUserPreferences = async (preferences) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        throw new Error('Not authenticated');
    }

    try {
        const response = await fetch(`${API_ENDPOINTS.AUTH}/preferences`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(preferences)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to update preferences');
        }

        return data;
    } catch (error) {
        console.error('Error updating preferences:', error);
        throw error;
    }
};
