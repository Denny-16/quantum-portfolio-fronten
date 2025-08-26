import { createSlice } from "@reduxjs/toolkit";

const saved = (() => {
  try { return JSON.parse(localStorage.getItem("ui") || "{}"); } catch { return {}; }
})();

const initialState = {
  // core
  dataset: saved.dataset ?? "nifty50",
  riskLevel: saved.riskLevel ?? "medium", // 'low' | 'medium' | 'high'
  options: saved.options ?? [],

  // tunables
  initialEquity: saved.initialEquity ?? 108000,
  timeHorizon: saved.timeHorizon ?? 15, // days
  threshold: saved.threshold ?? 0,      // %

  // nav
  activeTab: saved.activeTab ?? null,   // null = Home, else 'compare'|'evolution'|'insights'|'stress'|'explain'

  // ui
  isAboutOpen: false,
  toasts: [],
};

let toastId = 1;

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // nav toggle: clicking same tab goes back to Home
    setActiveTab: (s, a) => {
      const next = a.payload;
      s.activeTab = s.activeTab === next ? null : next;
    },

    // basic filters
    setDataset: (s, a) => { s.dataset = a.payload; },
    setRiskLevel: (s, a) => { s.riskLevel = a.payload; }, // 'low'|'medium'|'high'
    setOptions: (s, a) => { s.options = a.payload; },

    // tunables
    setInitialEquity: (s, a) => { s.initialEquity = Number(a.payload) || 0; },
    setTimeHorizon: (s, a) => { s.timeHorizon = Math.max(1, Number(a.payload) || 1); },
    setThreshold: (s, a) => { s.threshold = Math.max(0, Math.min(100, Number(a.payload) || 0)); },

    // about + toasts
    openAbout: (s) => { s.isAboutOpen = true; },
    closeAbout: (s) => { s.isAboutOpen = false; },
    addToast: (s, a) => { s.toasts.push({ id: toastId++, type: a.payload.type ?? "info", msg: a.payload.msg }); },
    removeToast: (s, a) => { s.toasts = s.toasts.filter(t => t.id !== a.payload); },
  },
});

export const {
  setActiveTab,
  setDataset, setRiskLevel, setOptions,
  setInitialEquity, setTimeHorizon, setThreshold,
  openAbout, closeAbout, addToast, removeToast,
} = uiSlice.actions;

export default uiSlice.reducer;

// persist some fields
export const uiMiddleware = store => next => action => {
  const res = next(action);
  const { ui } = store.getState();
  const persist = {
    dataset: ui.dataset,
    riskLevel: ui.riskLevel,
    options: ui.options,
    initialEquity: ui.initialEquity,
    timeHorizon: ui.timeHorizon,
    threshold: ui.threshold,
    activeTab: ui.activeTab,
  };
  try { localStorage.setItem("ui", JSON.stringify(persist)); } catch {}
  return res;
};
