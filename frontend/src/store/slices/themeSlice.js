import { createSlice } from "@reduxjs/toolkit";

const stored = localStorage.getItem("posTheme") || "light";
if (stored === "dark") document.documentElement.classList.add("dark");

const themeSlice = createSlice({
  name: "theme",
  initialState: { mode: stored },
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
      localStorage.setItem("posTheme", state.mode);
      document.documentElement.classList.toggle("dark", state.mode === "dark");
    },
  },
});

export const { toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;