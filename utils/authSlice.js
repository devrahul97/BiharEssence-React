import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        isAuthenticated: false,
        user: null,
        role: 'user' // 'admin' or 'user'
    },
    reducers: {
        login: (state, action) => {
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.role = action.payload.role || 'user';
            // Clear previous user's cart on login to prevent cross-user data sharing
            localStorage.removeItem('cart');
        },
        setUser: (state, action) => {
            state.isAuthenticated = true;
            state.user = action.payload;
            state.role = action.payload.role || 'customer';
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.role = null;
            // Clear sensitive user data (token, cart)
            // Theme and language will be reset to default by their respective slices
            localStorage.removeItem('token');
            localStorage.removeItem('cart');
        }
    }
});

export const { login, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
