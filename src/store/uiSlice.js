// uiSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  dataset: "", // "nifty50", "crypto", "nasdaq"
  risk: 5, // risk slider default
  options: [], // ["Sharpe Ratio", ...]
  isSidebarOpen: false, // <-- add this
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setDataset: (state, action) => {
      state.dataset = action.payload;
    },
    setRisk: (state, action) => {
      state.risk = action.payload;
    },
    toggleOption: (state, action) => {
      const option = action.payload;
      if (state.options.includes(option)) {
        state.options = state.options.filter((o) => o !== option);
      } else {
        state.options.push(option);
      }
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    resetUI: () => initialState,
  },
});

export const { setDataset, setRisk, toggleOption, resetUI, toggleSidebar } =
  uiSlice.actions;
export default uiSlice.reducer;
