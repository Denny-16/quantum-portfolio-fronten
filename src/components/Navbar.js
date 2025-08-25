import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { setDataset, setRiskLevel, toggleSidebar } from "../store/uiSlice";

export default function Navbar() {
  const dispatch = useDispatch();
  const { dataset, riskLevel } = useSelector((s) => s.ui);

  const datasetLabel =
    dataset === "nifty50" ? "NIFTY 50" :
    dataset === "nasdaq"  ? "NASDAQ"   :
    dataset === "crypto"  ? "Crypto"   :
    "Select Dataset";

  const prettyRisk = (riskLevel || "medium").replace(/^\w/, c => c.toUpperCase());

  return (
    <header className="w-full bg-[#0f1422] border-b border-zinc-800/70 sticky top-0 z-20">
      <div className="h-14 px-4 md:px-6 flex items-center justify-between gap-3">
        {/* Left: brand + mobile hamburger */}
        <div className="flex items-center gap-3">
          {/* Hamburger (mobile) */}
          <button
            className="lg:hidden p-2 rounded-lg bg-zinc-800/60"
            onClick={() => dispatch(toggleSidebar())}
            aria-label="Toggle sidebar"
            title="Open Filters & Constraints"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>

          <div className="font-semibold tracking-tight">
            Quantum Portfolio Optimizer — <span className="text-indigo-400">QAOA</span>
          </div>
        </div>

        {/* Right: quick filters */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Dataset select */}
          <div className="hidden sm:flex items-center gap-2 bg-zinc-900/60 border border-zinc-800/70 rounded-xl px-2 py-1.5">
            <span className="text-xs text-zinc-400">Dataset</span>
            <select
              value={dataset}
              onChange={(e) => dispatch(setDataset(e.target.value))}
              className="bg-transparent text-sm outline-none"
              title="Select dataset"
            >
              <option value="">{dataset ? datasetLabel : "— choose —"}</option>
              <option value="nifty50">NIFTY 50</option>
              <option value="nasdaq">NASDAQ</option>
              <option value="crypto">Crypto</option>
            </select>
          </div>

          {/* Risk segmented control */}
          <div className="hidden sm:flex items-center bg-zinc-900/60 border border-zinc-800/70 rounded-xl p-1">
            {["low", "medium", "high"].map((lvl) => (
              <button
                key={lvl}
                onClick={() => dispatch(setRiskLevel(lvl))}
                className={`px-3 py-1.5 rounded-lg text-xs md:text-sm transition ${
                  riskLevel === lvl
                    ? "bg-zinc-800/60 text-zinc-100"
                    : "text-zinc-300 hover:bg-zinc-800/30"
                }`}
                title={`Risk: ${lvl}`}
              >
                {lvl[0].toUpperCase() + lvl.slice(1)}
              </button>
            ))}
          </div>

          {/* Current selections (mobile compact) */}
          <div className="sm:hidden text-xs text-zinc-400">
            {datasetLabel} • {prettyRisk}
          </div>

          {/* Open Constraints (always visible) */}
          
        </div>
      </div>
    </header>
  );
}
