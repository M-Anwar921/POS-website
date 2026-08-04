import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],           // { product, name, price, quantity, stock }
  customer: null,       // { _id, name, phone } or null
  discountType: "flat",
  discountValue: 0,
  taxPercent: 0,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action) => {
      const product = action.payload;
      const existing = state.items.find((i) => i.product === product._id);
      if (existing) {
        if (existing.quantity < product.stock) existing.quantity += 1;
      } else {
        state.items.push({
          product: product._id,
          name: product.name,
          price: product.price,
          quantity: 1,
          stock: product.stock,
        });
      }
    },
    incrementItem: (state, action) => {
      const item = state.items.find((i) => i.product === action.payload);
      if (item && item.quantity < item.stock) item.quantity += 1;
    },
    decrementItem: (state, action) => {
      const item = state.items.find((i) => i.product === action.payload);
      if (item) {
        item.quantity -= 1;
        if (item.quantity <= 0) {
          state.items = state.items.filter((i) => i.product !== action.payload);
        }
      }
    },
    removeItem: (state, action) => {
      state.items = state.items.filter((i) => i.product !== action.payload);
    },
    setCustomer: (state, action) => {
      state.customer = action.payload;
    },
    setDiscount: (state, action) => {
      state.discountType = action.payload.type;
      state.discountValue = action.payload.value;
    },
    setTax: (state, action) => {
      state.taxPercent = action.payload;
    },
    loadCartItems: (state, action) => {
      state.items = action.payload;
    },
    clearCart: () => initialState,
  },
});

export const {
  addItem, incrementItem, decrementItem, removeItem,
  setCustomer, setDiscount, setTax, loadCartItems, clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;