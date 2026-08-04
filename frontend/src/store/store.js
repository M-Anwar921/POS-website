import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import themeReducer from "./slices/themeSlice";
import cartReducer from "./slices/cartSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    cart: cartReducer,

  },
});