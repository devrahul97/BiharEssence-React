import { createSlice } from "@reduxjs/toolkit";

const languageSlice = createSlice({
  name: "language",
  initialState: {
    // Default to English for guests, will be overridden on login
    currentLanguage: "english",
  },
  reducers: {
    setLanguage: (state, action) => {
      state.currentLanguage = action.payload;
    },
    resetLanguage: (state) => {
      // Reset to default English (for logout)
      state.currentLanguage = "english";
    },
  },
});

export const { setLanguage, resetLanguage } = languageSlice.actions;
export default languageSlice.reducer;
