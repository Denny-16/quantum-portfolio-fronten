// src/components/Sidebar.js
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setDataset, setRiskLevel, toggleOption, setInitialEquity,
} from "../store/uiSlice";

export default function Sidebar() {
  const dispatch = useDispatch();
  const { dataset, riskLevel, options, initialEquity } = useSelector((s) => s.ui);

  return (
    <div className="w-64 bg-[#0f1422] border-r border-zinc-800/70 p-5 hidden md:block">
      <h2 className="text-lg font-semibold mb-4 text-indigo-400">Home</h2>

      {/* Dataset */}
      <div className="mb-4">
        <label className="block text-sm text-zinc-300 mb-1">Dataset</label>
        <select
          value={dataset}
          onChange={(e) => dispatch(setDataset(e.target.value))}
          className="w-full px-3 py-2 rounded-lg bg-[#0b0f1a] border border-zinc-700 text-sm"
        >
          <option value="nifty50">NIFTY 50</option>
          <option value="crypto">Crypto</option>
          <option value="nasdaq">NASDAQ</option>
        </select>
      </div>

      {/* Risk Level */}
      <div className="mb-4">
        <label className="block text-sm text-zinc-300 mb-1">Risk Level</label>
        <select
          value={riskLevel}
          onChange={(e) => dispatch(setRiskLevel(e.target.value))}
          className="w-full px-3 py-2 rounded-lg bg-[#0b0f1a] border border-zinc-700 text-sm"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {/* Initial Equity */}
      <div className="mb-4">
        <label className="block text-sm text-zinc-300 mb-1">Initial Equity</label>
        <input
          type="number"
          value={initialEquity}
          onChange={(e) => dispatch(setInitialEquity(Number(e.target.value)))}
          className="w-full px-3 py-2 rounded-lg bg-[#0b0f1a] border border-zinc-700 text-sm"
        />
      </div>

      {/* Options */}
      <div className="mb-6">
        <label className="block text-sm text-zinc-300 mb-2">Options</label>
        {["Sharpe Ratio", "Stress Testing", "Classical Comparison"].map((opt) => (
          <label key={opt} className="flex items-center gap-2 text-sm text-zinc-400 mb-1">
            <input
              type="checkbox"
              checked={options.includes(opt)}
              onChange={() => dispatch(toggleOption(opt))}
              className="accent-indigo-500"
            />
            {opt}
          </label>
        ))}
      </div>

      <p className="text-xs text-zinc-500">← Use Navbar to open sections</p>
    </div>
  );
}
