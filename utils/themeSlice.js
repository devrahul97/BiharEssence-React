import { createSlice } from "@reduxjs/toolkit";

const themeSlice = createSlice({
  name: "theme",
  initialState: {
    // Default to light theme for guests, will be overridden on login
    isDark: false,
  },
  reducers: {
    toggleTheme: (state) => {
      state.isDark = !state.isDark;
    },
    setTheme: (state, action) => {
      // action.payload should be 'dark' or 'light'
      state.isDark = action.payload === 'dark';
    },
    resetTheme: (state) => {
      // Reset to default light theme (for logout)
      state.isDark = false;
    },
  },
});

export const { toggleTheme, setTheme, resetTheme } = themeSlice.actions;
export default themeSlice.reducer;
