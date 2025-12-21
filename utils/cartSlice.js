import { createSlice } from "@reduxjs/toolkit";

// Load cart from localStorage
const loadCartFromLocalStorage = () => {
    try {
        const savedCart = localStorage.getItem('cart');
        return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        return [];
    }
};

// Save cart to localStorage
const saveCartToLocalStorage = (items) => {
    try {
        localStorage.setItem('cart', JSON.stringify(items));
    } catch (error) {
        console.error('Error saving cart to localStorage:', error);
    }
};

const cartSlice = createSlice({
    name: 'cart',
    initialState: {
        items: loadCartFromLocalStorage()
    },
    reducers: {
        addItem: (state, action) => {
            // Check if item already exists in cart
            const existingItem = state.items.find(item => item.id === action.payload.id);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                state.items.push({ ...action.payload, quantity: 1 });
            }
            saveCartToLocalStorage(state.items);
        },
        removeItem: (state, action) => {
            state.items = state.items.filter(item => item.id !== action.payload);
            saveCartToLocalStorage(state.items);
        },
        updateQuantity: (state, action) => {
            const item = state.items.find(item => item.id === action.payload.id);
            if (item) {
                item.quantity = action.payload.quantity;
                if (item.quantity <= 0) {
                    state.items = state.items.filter(item => item.id !== action.payload.id);
                }
            }
            saveCartToLocalStorage(state.items);
        },
        clearCart: (state) => {
            state.items = [];
            saveCartToLocalStorage(state.items);
        }
    }
});

export const { addItem, removeItem, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
