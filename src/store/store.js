import { configureStore } from "@reduxjs/toolkit";
import uiReducer, { uiMiddleware } from "./uiSlice";

const store = configureStore({
  reducer: { ui: uiReducer },
  middleware: (getDefault) => getDefault().concat(uiMiddleware),
});

export default store;
