import { createSlice } from "@reduxjs/toolkit";

const saved = (() => {
  try { return JSON.parse(localStorage.getItem("ui") || "{}"); } catch { return {}; }
})();

const initialState = {
  dataset: saved.dataset ?? "",
  risk: saved.risk ?? 5,
  options: saved.options ?? [],              // ["Sharpe Ratio", "Stress Testing", "Classical Comparison"]
  isSidebarOpen: saved.isSidebarOpen ?? false,

  // NEW global inputs
  initialEquity: saved.initialEquity ?? 100000, // ₹100k default
  timeHorizon: saved.timeHorizon ?? 12,         // 12 periods default
  threshold: saved.threshold ?? 0,              // 0 = disabled

  // UI helpers
  toasts: [],                                   // { id, type, msg }
  isAboutOpen: false,
};

let toastId = 1;

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setDataset: (s, a) => { s.dataset = a.payload; },
    setRisk: (s, a) => { s.risk = a.payload; },
    setOptions: (s, a) => { s.options = a.payload; },

    toggleOption: (s, a) => {
      const opt = a.payload;
      s.options = s.options.includes(opt) ? s.options.filter(o => o !== opt) : [...s.options, opt];
    },

    toggleSidebar: (s) => { s.isSidebarOpen = !s.isSidebarOpen; },

    // Toasts + About
    addToast: (s, a) => { s.toasts.push({ id: toastId++, type: a.payload.type ?? "info", msg: a.payload.msg }); },
    removeToast: (s, a) => { s.toasts = s.toasts.filter(t => t.id !== a.payload); },
    openAbout: (s) => { s.isAboutOpen = true; },
    closeAbout: (s) => { s.isAboutOpen = false; },

    // NEW actions
    setInitialEquity: (s, a) => { s.initialEquity = a.payload; },
    setTimeHorizon: (s, a) => { s.timeHorizon = a.payload; },
    setThreshold: (s, a) => { s.threshold = a.payload; },
  },
});

export const {
  setDataset, setRisk, setOptions, toggleOption, toggleSidebar,
  addToast, removeToast, openAbout, closeAbout,
  setInitialEquity, setTimeHorizon, setThreshold,
} = uiSlice.actions;

export default uiSlice.reducer;

// --- PERSIST UI → localStorage ---
export const uiMiddleware = store => next => action => {
  const res = next(action);
  const { ui } = store.getState();
  const persist = {
    dataset: ui.dataset,
    risk: ui.risk,
    options: ui.options,
    isSidebarOpen: ui.isSidebarOpen,
    // NEW persisted fields
    initialEquity: ui.initialEquity,
    timeHorizon: ui.timeHorizon,
    threshold: ui.threshold,
  };
  try { localStorage.setItem("ui", JSON.stringify(persist)); } catch {}
  return res;
};
