import { createSlice } from "@reduxjs/toolkit";

const saved = (() => {
  try { return JSON.parse(localStorage.getItem("ui") || "{}"); } catch { return {}; }
})();

const initialState = {
  dataset: saved.dataset ?? "",
  risk: saved.risk ?? 5,
  options: saved.options ?? [],              // array of strings like ["Sharpe Ratio", "Stress Testing"]
  isSidebarOpen: saved.isSidebarOpen ?? false,
  // NEW:
  toasts: [],                                // { id, type: 'success'|'error'|'info', msg }
  isAboutOpen: false,                        // About modal open state
};

let toastId = 1;

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setDataset: (s, a) => { s.dataset = a.payload; },
    setRisk: (s, a) => { s.risk = a.payload; },
    setOptions: (s, a) => { s.options = a.payload; },

    // Toggle a single option on/off (used by Sidebar checkboxes)
    toggleOption: (s, a) => {
      const opt = a.payload;
      if (s.options.includes(opt)) {
        s.options = s.options.filter(o => o !== opt);
      } else {
        s.options.push(opt);
      }
    },

    toggleSidebar: (s) => { s.isSidebarOpen = !s.isSidebarOpen; },

    // Toasts + About modal
    addToast: (s, a) => { s.toasts.push({ id: toastId++, type: a.payload.type ?? "info", msg: a.payload.msg }); },
    removeToast: (s, a) => { s.toasts = s.toasts.filter(t => t.id !== a.payload); },
    openAbout: (s) => { s.isAboutOpen = true; },
    closeAbout: (s) => { s.isAboutOpen = false; },
  },
});

export const {
  setDataset, setRisk, setOptions, toggleOption, toggleSidebar,
  addToast, removeToast, openAbout, closeAbout,
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
  };
  try { localStorage.setItem("ui", JSON.stringify(persist)); } catch {}
  return res;
};
