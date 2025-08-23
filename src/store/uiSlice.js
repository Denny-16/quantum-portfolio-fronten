import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  dataset: "", // "nifty50", "crypto", "nasdaq"
  risk: 5, // risk slider default
  options: [], // ["Sharpe Ratio", ...]
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
    resetUI: () => initialState,
  },
});

export const { setDataset, setRisk, toggleOption, resetUI } = uiSlice.actions;
export default uiSlice.reducer;
