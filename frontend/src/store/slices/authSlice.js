import { createSlice } from "@reduxjs/toolkit";

const storedUser = localStorage.getItem("posUser");

const initialState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  isAuthenticated: !!storedUser,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem("posUser", JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("posUser");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;