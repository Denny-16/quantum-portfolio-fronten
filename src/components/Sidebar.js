// src/components/Sidebar.js
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setDataset, setRiskLevel, toggleOption, toggleSidebar,
  setInitialEquity, setTimeHorizon, setThreshold
} from "../store/uiSlice";

const OPTIONS = ["Sharpe Ratio", "Stress Testing", "Classical Comparison"];

export default function Sidebar() {
  const dispatch = useDispatch();
  const {
    dataset, riskLevel, options, isSidebarOpen,
    initialEquity, timeHorizon, threshold
  } = useSelector((s) => s.ui);

  const handleDataset = (e) => dispatch(setDataset(e.target.value));
  const handleRiskLevel = (e) => dispatch(setRiskLevel(e.target.value));
  const handleOption = (label) => () => dispatch(toggleOption(label));

  return (
    <>
      {/* Backdrop for mobile */}
      <div
        className={`fixed inset-0 bg-black/40 z-30 lg:hidden transition-opacity ${
          isSidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => dispatch(toggleSidebar())}
      />

      <aside
        className={`z-40 w-[300px] shrink-0 bg-[#0f1422] border-r border-zinc-800/70
        h-screen p-5 overflow-y-auto transition-transform fixed lg:static
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <h2 className="text-lg font-semibold">Filters</h2>
          <button
            className="px-3 py-1 rounded-lg bg-zinc-800/60"
            onClick={() => dispatch(toggleSidebar())}
          >
            Close
          </button>
        </div>

        <div className="space-y-6">
          {/* Dataset */}
          <section>
            <label className="block text-sm text-zinc-400 mb-1">Select Dataset</label>
            <select
              value={dataset}
              onChange={handleDataset}
              className="w-full rounded-xl bg-[#0b0f1a] border border-zinc-800/70 px-3 py-2 outline-none"
            >
              <option value="">-- choose --</option>
              <option value="nifty50">NIFTY 50</option>
              <option value="nasdaq">NASDAQ</option>
              <option value="crypto">Crypto</option>
            </select>
          </section>

          {/* Risk level (Low / Medium / High) */}
          <section>
            <h3 className="text-sm font-medium text-zinc-300 mb-2">Risk Preference</h3>
            <div className="grid grid-cols-3 gap-2">
              {["low", "medium", "high"].map((lvl) => (
                <label
                  key={lvl}
                  className={`text-sm text-center rounded-lg border px-2 py-2 cursor-pointer
                    ${riskLevel === lvl ? "bg-indigo-600 border-indigo-500" : "bg-[#0b0f1a] border-zinc-700 hover:border-zinc-600"}`}
                >
                  <input
                    type="radio"
                    name="riskLevel"
                    value={lvl}
                    checked={riskLevel === lvl}
                    onChange={handleRiskLevel}
                    className="hidden"
                  />
                  {lvl[0].toUpperCase() + lvl.slice(1)}
                </label>
              ))}
            </div>
          </section>

          {/* Simulation Inputs */}
          <section>
            <h3 className="text-sm font-medium text-zinc-300 mb-2">Simulation Inputs</h3>

            <div className="space-y-3">
              {/* Initial Equity */}
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Initial Equity (₹)</label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  className="w-full rounded-lg bg-[#0b0f1a] border border-zinc-700 px-3 py-2 text-sm"
                  value={initialEquity}
                  onChange={(e) => dispatch(setInitialEquity(Math.max(0, Number(e.target.value) || 0)))}
                />
              </div>

              {/* Time Horizon (days) */}
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Time Horizon (days)</label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  step={1}
                  className="w-full rounded-lg bg-[#0b0f1a] border border-zinc-700 px-3 py-2 text-sm"
                  value={timeHorizon}
                  onChange={(e) =>
                    dispatch(setTimeHorizon(Math.max(1, Math.min(365, Number(e.target.value) || 1))))
                  }
                />
              </div>

              {/* Threshold (%) */}
              <div className="space-y-1">
                <label className="text-xs text-zinc-400">Threshold (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  className="w-full rounded-lg bg-[#0b0f1a] border border-zinc-700 px-3 py-2 text-sm"
                  value={threshold}
                  onChange={(e) =>
                    dispatch(setThreshold(Math.max(0, Math.min(100, Number(e.target.value) || 0))))
                  }
                />
                <div className="text-[11px] text-zinc-500">
                  Filters low-probability candidates (auto-applies).
                </div>
              </div>
            </div>
          </section>

          {/* Options */}
          <section>
            <h3 className="text-sm font-medium text-zinc-300 mb-2">Options</h3>
            <div className="space-y-2">
              {OPTIONS.map((label) => (
                <label key={label} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={options.includes(label)}
                    onChange={handleOption(label)}
                    className="accent-indigo-500"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </section>

          <button className="w-full mt-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition">
            Export Results
          </button>
        </div>
      </aside>
    </>
  );
}
