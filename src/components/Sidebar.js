import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setDataset, setRiskLevel, toggleOption, toggleSidebar,
  setInitialEquity, setTimeHorizon, setThreshold
} from "../store/uiSlice";

const OPTIONS = ["Sharpe Ratio", "Stress Testing", "Classical Comparison"];

export default function Sidebar({
  // constraints managed in Dashboard state
  sectorCaps, setSectorCaps,
  esgExclude, setEsgExclude,
  turnoverCap, setTurnoverCap,
  onApplyConstraints,
  applying = false,
}) {
  const dispatch = useDispatch();
  const {
    dataset, riskLevel, options, isSidebarOpen,
    initialEquity, timeHorizon, threshold,
  } = useSelector((s) => s.ui);

  // handlers (Redux)
  const handleDataset = (e) => dispatch(setDataset(e.target.value));
  const handleRisk = (lvl) => dispatch(setRiskLevel(lvl));
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
        {/* Mobile header */}
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <h2 className="text-lg font-semibold">Filters & Constraints</h2>
          <button
            className="px-3 py-1 rounded-lg bg-zinc-800/60"
            onClick={() => dispatch(toggleSidebar())}
          >
            Close
          </button>
        </div>

        <div className="space-y-6">
          {/* Brand / Title */}
          <div>
            <h3 className="text-xl font-semibold">Quantum Portfolio</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Configure dataset, risk & constraints</p>
          </div>

          {/* Dataset */}
          <section>
            <label className="block text-sm text-zinc-400 mb-1">Select Dataset</label>
            <select
              value={dataset}
              onChange={handleDataset}
              className="w-full rounded-xl bg-[#0b0f1a] border border-zinc-800/70 px-3 py-2 outline-none"
            >
              <option value="">— choose —</option>
              <option value="nifty50">NIFTY 50</option>
              <option value="nasdaq">NASDAQ</option>
              <option value="crypto">Crypto</option>
            </select>
          </section>

          {/* Risk (Low/Medium/High) */}
          <section>
            <h3 className="text-sm font-medium text-zinc-300 mb-2">Risk Preference</h3>
            <div className="grid grid-cols-3 gap-2">
              {["low", "medium", "high"].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => handleRisk(lvl)}
                  className={`px-3 py-2 rounded-lg text-sm transition ${
                    riskLevel === lvl ? "bg-zinc-800/60" : "hover:bg-zinc-800/30"
                  }`}
                >
                  {lvl[0].toUpperCase() + lvl.slice(1)}
                </button>
              ))}
            </div>
          </section>

          {/* Simulation inputs */}
          <section>
            <h3 className="text-sm font-medium text-zinc-300 mb-2">Simulation</h3>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-zinc-300 mb-1">Initial Equity (₹)</label>
                <input
                  type="number"
                  value={initialEquity}
                  min={1000}
                  step={1000}
                  onChange={(e) => dispatch(setInitialEquity(Number(e.target.value) || 0))}
                  className="w-full bg-[#0b0f1a] border border-zinc-700 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">Time Horizon (days)</label>
                <input
                  type="number"
                  value={timeHorizon}
                  min={1}
                  step={1}
                  onChange={(e) => dispatch(setTimeHorizon(Number(e.target.value) || 1))}
                  className="w-full bg-[#0b0f1a] border border-zinc-700 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-zinc-300 mb-1">Threshold (%)</label>
                <input
                  type="number"
                  value={threshold}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(e) => dispatch(setThreshold(Number(e.target.value) || 0))}
                  className="w-full bg-[#0b0f1a] border border-zinc-700 rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </section>

          {/* Options */}
          <section>
            <h3 className="text-sm font-medium text-zinc-300 mb-2">Show/Hide Panels</h3>
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

          {/* Constraints (moved here from Dashboard) */}
          <section>
            <h3 className="text-sm font-medium text-zinc-300 mb-2">Constraints</h3>

            {/* Sector caps */}
            <div className="mb-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                {Object.keys(sectorCaps).map((k) => (
                  <div key={k}>
                    <label className="block text-zinc-300 mb-1">{k} Cap (%)</label>
                    <input
                      type="number"
                      className="w-full bg-[#0b0f1a] border border-zinc-700 rounded-lg px-3 py-2"
                      value={sectorCaps[k]}
                      min={0}
                      max={100}
                      onChange={(e) => setSectorCaps({ ...sectorCaps, [k]: Number(e.target.value) })}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* ESG + Turnover */}
            <div className="space-y-4 text-sm">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-indigo-500 w-4 h-4"
                  checked={esgExclude}
                  onChange={(e) => setEsgExclude(e.target.checked)}
                />
                <span>Exclude non-ESG (e.g., oil/coal)</span>
              </label>

              <div>
                <label className="block text-zinc-300 mb-1">Turnover Cap (%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={turnoverCap}
                  onChange={(e) => setTurnoverCap(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
                <div className="text-zinc-400 mt-1">{turnoverCap}% max rebalance turnover</div>
              </div>

              <button
                onClick={onApplyConstraints}
                className="w-full px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60"
                disabled={applying}
              >
                {applying ? "Applying…" : "Apply Constraints"}
              </button>
            </div>
          </section>
        </div>
      </aside>
    </>
  );
}
