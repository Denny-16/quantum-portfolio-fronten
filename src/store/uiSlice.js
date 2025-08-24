import { createSlice } from "@reduxjs/toolkit";

const saved = (() => {
  try { return JSON.parse(localStorage.getItem("ui") || "{}"); } catch { return {}; }
})();

function numericToLevel(n) {
  const num = Number(n);
  if (!isFinite(num)) return "medium";
  if (num <= 3) return "low";
  if (num >= 8) return "high";
  return "medium";
}

const initialState = {
  dataset: saved.dataset ?? "",
  // prefer saved.riskLevel; fallback convert old numeric "risk"
  riskLevel: saved.riskLevel ?? (saved.risk != null ? numericToLevel(saved.risk) : "medium"),
  options: saved.options ?? [],
  isSidebarOpen: saved.isSidebarOpen ?? false,

  initialEquity: saved.initialEquity ?? 100000,
  timeHorizon: saved.timeHorizon ?? 30,
  threshold: saved.threshold ?? 0,

  toasts: [],
  isAboutOpen: false,
};

let toastId = 1;

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setDataset: (s, a) => { s.dataset = a.payload; },
    setRiskLevel: (s, a) => { s.riskLevel = a.payload || "medium"; },
    setOptions: (s, a) => { s.options = a.payload; },
    toggleOption: (s, a) => {
      const opt = a.payload;
      s.options = s.options.includes(opt) ? s.options.filter(o => o !== opt) : [...s.options, opt];
    },
    toggleSidebar: (s) => { s.isSidebarOpen = !s.isSidebarOpen; },

    addToast: (s, a) => { s.toasts.push({ id: toastId++, type: a.payload?.type ?? "info", msg: a.payload?.msg ?? "" }); },
    removeToast: (s, a) => { s.toasts = s.toasts.filter(t => t.id !== a.payload); },
    openAbout: (s) => { s.isAboutOpen = true; },
    closeAbout: (s) => { s.isAboutOpen = false; },

    setInitialEquity: (s, a) => { s.initialEquity = Number(a.payload) || 0; },
    setTimeHorizon: (s, a) => { s.timeHorizon = Number(a.payload) || 1; },
    setThreshold: (s, a) => { s.threshold = Number(a.payload) || 0; },
  },
});

export const {
  setDataset, setRiskLevel, setOptions, toggleOption, toggleSidebar,
  addToast, removeToast, openAbout, closeAbout,
  setInitialEquity, setTimeHorizon, setThreshold,
} = uiSlice.actions;

export default uiSlice.reducer;

// persist selected UI to localStorage
export const uiMiddleware = store => next => action => {
  const res = next(action);
  const { ui } = store.getState();
  const persist = {
    dataset: ui.dataset,
    riskLevel: ui.riskLevel,
    options: ui.options,
    isSidebarOpen: ui.isSidebarOpen,
    initialEquity: ui.initialEquity,
    timeHorizon: ui.timeHorizon,
    threshold: ui.threshold,
  };
  try { localStorage.setItem("ui", JSON.stringify(persist)); } catch {}
  return res;
};
