import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import cartReducer from "./cartSlice";
import languageReducer from "./languageSlice";
import themeReducer from "./themeSlice";

const appStore = configureStore({
    reducer: {
        cart: cartReducer,
        auth: authReducer,
        theme: themeReducer,
        language: languageReducer,
    }
});

export default appStore;


