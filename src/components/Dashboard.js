// src/components/Dashboard.js
import React, { useEffect, useMemo, useState } from "react";
// Sidebar removed
import Navbar from "./Navbar.js";
import { useDispatch, useSelector } from "react-redux";
import { addToast, setActiveTab, setTimeHorizon, setThreshold } from "../store/uiSlice";
import EmptyState from "./EmptyState.js";
import Skeleton from "./Skeleton.js";
import { downloadJSON, downloadCSV } from "../utils/exporters.js";
import InsightsPanel from "./InsightsPanel.js";

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar, CartesianGrid, Label,
} from "recharts";

import {
  fetchEfficientFrontier,
  fetchSharpeComparison,
  runQAOASelection,
  fetchAllocation,
  backtestEvolution,
  stressSim,
} from "../lib/mockApi.js";

// ---------- Small UI helpers ----------
const Card = ({ title, children, className = "" }) => (
  <div className={`bg-[#0f1422] border border-zinc-800/70 rounded-2xl p-4 shadow-sm ${className}`}>
    {title ? (
      <h2 className="text-[15px] md:text-lg font-semibold tracking-tight mb-2 text-zinc-100">{title}</h2>
    ) : null}
    {children}
  </div>
);

const HomeCard = ({ title, subtitle, onGo, action = "Open" }) => (
  <div className="bg-gradient-to-b from-[#11182b] to-[#0f1422] border border-zinc-800/70 rounded-2xl p-5 shadow-sm">
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="text-base md:text-lg font-semibold tracking-tight text-zinc-100">{title}</h3>
        <p className="text-sm text-zinc-400 mt-1">{subtitle}</p>
      </div>
      <button
        onClick={onGo}
        className="shrink-0 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm"
      >
        {action}
      </button>
    </div>
  </div>
);

const ChartCaption = ({ x, y }) => (
  <div className="mt-2 text-[11px] text-zinc-400">
    <span className="mr-6">X: {x}</span>
    <span>Y: {y}</span>
  </div>
);

const COLORS = ["#7C3AED", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#22C55E", "#06B6D4"];
const currency = (v) => `₹${Number(v).toLocaleString("en-IN")}`;
const percent = (v, digits = 0) => `${Number(v).toFixed(digits)}%`;

const tooltipStyles = {
  contentStyle: {
    background: "#111827",
    border: "1px solid #6366F1",
    borderRadius: 8,
    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  },
  labelStyle: { color: "#C7D2FE", fontSize: 12 },
  itemStyle: { color: "#E5E7EB", fontSize: 12 },
  wrapperStyle: { zIndex: 50 },
};

export default function Dashboard() {
  const dispatch = useDispatch();
  const {
    dataset, riskLevel, options,
    initialEquity, timeHorizon, threshold,
    activeTab,
  } = useSelector((s) => s.ui);

  // SAFE risk label
  const safeRiskLevel = (typeof riskLevel === "string" && riskLevel.length) ? riskLevel : "medium";
  const riskPretty = safeRiskLevel.charAt(0).toUpperCase() + safeRiskLevel.slice(1);

  const [activeSlice, setActiveSlice] = useState(null);

  // Local constraint controls (shown on Home only)
  const [sectorCaps, setSectorCaps] = useState({ Tech: 40, Finance: 35, Healthcare: 35, Energy: 25 });
  const [turnoverCap, setTurnoverCap] = useState(20);
  const [esgExclude, setEsgExclude] = useState(true);
  const [useHybrid, setUseHybrid] = useState(true);

  // Section-specific controls
  const [rebalanceFreq, setRebalanceFreq] = useState("Monthly"); // shown in compare & evolution only
  // Stress controls
  const [stress, setStress] = useState({ ratesBps: 200, oilPct: 15, techPct: -8, fxPct: 3 });

  // Data state
  const [frontier, setFrontier] = useState([]);
  const [sharpeData, setSharpeData] = useState([]);
  const [alloc, setAlloc] = useState([]);
  const [evolution, setEvolution] = useState([]);
  const [topBits, setTopBits] = useState([]);
  const [stressed, setStressed] = useState([]);

  // Loading flags
  const [loading, setLoading] = useState({
    frontier: false, sharpe: false, qaoa: false, alloc: false, evo: false, stress: false
  });

  // Build constraints object for API
  const constraints = useMemo(
    () => ({ sectorCaps, turnoverCap, esgExclude }),
    [sectorCaps, turnoverCap, esgExclude]
  );

  // ---------- Effects ----------
  useEffect(() => {
    (async () => {
      try {
        setLoading((l) => ({ ...l, frontier: true, sharpe: true, qaoa: true, alloc: true, evo: true }));
        const [f, s, bits] = await Promise.all([
          fetchEfficientFrontier({ riskLevel: safeRiskLevel, constraints, threshold }),
          fetchSharpeComparison({}),
          runQAOASelection({ constraints, threshold }),
        ]);
        setFrontier(f);
        setSharpeData(s);
        setTopBits(bits);

        const allocData = await fetchAllocation({
          topBits: bits[0]?.bits || "10101",
          hybrid: useHybrid,
          threshold,
          dataset,
        });
        setAlloc(allocData);

        const evo = await backtestEvolution({ freq: rebalanceFreq, hybrid: useHybrid, initialEquity, timeHorizon });
        setEvolution(evo);
      } catch (e) {
        console.error(e);
        dispatch(addToast({ type: "error", msg: "Initial data load failed. Try again." }));
      } finally {
        setLoading((l) => ({ ...l, frontier: false, sharpe: false, qaoa: false, alloc: false, evo: false }));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Frontier depends on risk/constraints/threshold
  useEffect(() => {
    (async () => {
      try {
        setLoading((l) => ({ ...l, frontier: true }));
        const f = await fetchEfficientFrontier({ riskLevel: safeRiskLevel, constraints, threshold });
        setFrontier(f);
      } catch (e) {
        console.error(e);
        dispatch(addToast({ type: "error", msg: "Failed to update frontier." }));
      } finally {
        setLoading((l) => ({ ...l, frontier: false }));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeRiskLevel, threshold, constraints]);

  // Evolution depends on time/rebalance/hybrid/equity
  useEffect(() => {
    (async () => {
      try {
        setLoading((l) => ({ ...l, evo: true }));
        const evo = await backtestEvolution({ freq: rebalanceFreq, hybrid: useHybrid, initialEquity, timeHorizon });
        setEvolution(evo);
      } catch (e) {
        console.error(e);
        dispatch(addToast({ type: "error", msg: "Failed to recompute evolution." }));
      } finally {
        setLoading((l) => ({ ...l, evo: false }));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rebalanceFreq, useHybrid, initialEquity, timeHorizon]);

  // Threshold auto-applies QAOA + alloc + frontier
  useEffect(() => {
    (async () => {
      try {
        setLoading((l) => ({ ...l, qaoa: true, alloc: true, frontier: true }));
        const [bits, f] = await Promise.all([
          runQAOASelection({ constraints, threshold }),
          fetchEfficientFrontier({ riskLevel: safeRiskLevel, constraints, threshold }),
        ]);
        setTopBits(bits);
        const newAlloc = await fetchAllocation({
          topBits: bits[0]?.bits || "10101",
          hybrid: useHybrid,
          threshold,
          dataset,
        });
        setAlloc(newAlloc);
        setFrontier(f);
      } catch (e) {
        console.error(e);
        dispatch(addToast({ type: "error", msg: "Failed to apply threshold." }));
      } finally {
        setLoading((l) => ({ ...l, qaoa: false, alloc: false, frontier: false }));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threshold, useHybrid, constraints, safeRiskLevel]);

  // Stress sim depends on last evolution point and stress sliders
  useEffect(() => {
    (async () => {
      try {
        setLoading((l) => ({ ...l, stress: true }));
        const last = evolution[evolution.length - 1] || { Quantum: 121900, Classical: 112100 };
        const res = await stressSim({ lastQuantum: last.Quantum, lastClassical: last.Classical, stress });
        setStressed(res);
      } catch (e) {
        console.error(e);
        dispatch(addToast({ type: "error", msg: "Failed to run stress simulation." }));
      } finally {
        setLoading((l) => ({ ...l, stress: false }));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stress, evolution]);

  async function handleApplyConstraints() {
    try {
      setLoading((l) => ({ ...l, qaoa: true, alloc: true, frontier: true }));
      const [bits, f] = await Promise.all([
        runQAOASelection({ constraints, threshold }),
        fetchEfficientFrontier({ riskLevel: safeRiskLevel, constraints, threshold }),
      ]);
      setTopBits(bits);
      const newAlloc = await fetchAllocation({
        topBits: bits[0]?.bits || "10101",
        hybrid: useHybrid,
        threshold,
        dataset,
      });
      setAlloc(newAlloc);
      setFrontier(f);
      dispatch(addToast({ type: "success", msg: "Constraints applied." }));
    } catch (e) {
      console.error(e);
      dispatch(addToast({ type: "error", msg: "Failed to apply constraints." }));
    } finally {
      setLoading((l) => ({ ...l, qaoa: false, alloc: false, frontier: false }));
    }
  }

  // ---------- Derived ----------
  const datasetLabel =
    dataset === "nifty50" ? "NIFTY 50" :
    dataset === "crypto" ? "Crypto" :
    dataset === "nasdaq" ? "NASDAQ" :
    dataset || "Select Dataset";

  const centerLabelText =
    activeSlice === null ? "Weights (%)" : `${alloc[activeSlice]?.name ?? ""} · ${percent(alloc[activeSlice]?.value || 0, 0)}`;

  const showSharpe = !options?.length || options.includes("Sharpe Ratio");
  const showStress = !options?.length || options.includes("Stress Testing");
  const showClassical = !options?.length || options.includes("Classical Comparison");

  // ---------- Home (no sidebar) ----------
  const renderHome = () => (
    <div className="max-w-7xl mx-auto px-5 py-6 md:py-8 space-y-6">
      {/* Constraints panel on Home */}
      <Card title="Constraints">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-zinc-300 mb-2">Sector Caps (%)</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {Object.keys(sectorCaps).map((k) => (
                <div key={k}>
                  <label className="block text-zinc-300 mb-1">{k}</label>
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

            <label className="inline-flex items-center gap-2 text-sm cursor-pointer select-none">
              <input
                type="checkbox"
                className="accent-indigo-500 w-4 h-4"
                checked={useHybrid}
                onChange={(e) => setUseHybrid(e.target.checked)}
              />
              <span>Hybrid (QAOA + Weights): {useHybrid ? "Enabled" : "Disabled"}</span>
            </label>

            <button
              onClick={handleApplyConstraints}
              className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm disabled:opacity-60"
              disabled={loading.qaoa || loading.alloc || loading.frontier}
            >
              {(loading.qaoa || loading.alloc || loading.frontier) ? "Applying..." : "Apply Constraints"}
            </button>
          </div>
        </div>
      </Card>

      <div>
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">Welcome</h2>
        <p className="text-zinc-400 mt-1">
          Pick a section from the navbar, or use these cards to learn and jump in.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <HomeCard
          title="Quantum vs Classical"
          subtitle="Compare QAOA-driven portfolios vs classical baselines. Time (days) control lives inside this section."
          onGo={() => dispatch(setActiveTab("compare"))}
        />
        <HomeCard
          title="Portfolio Evolution"
          subtitle="Simulate multi-period rebalancing and see NAV over your chosen horizon. Time (days) control lives here."
          onGo={() => dispatch(setActiveTab("evolution"))}
        />
        <HomeCard
          title="Stress Testing"
          subtitle="Apply macro shocks (rates, oil, tech, FX). Threshold control is here."
          onGo={() => dispatch(setActiveTab("stress"))}
        />
        <HomeCard
          title="Explain"
          subtitle="See top bitstrings measured by QAOA: probabilities, return, risk, and constraints."
          onGo={() => dispatch(setActiveTab("explain"))}
        />
      </div>

      <Card>
        <div className="text-sm text-zinc-300 leading-relaxed">
          <p className="mb-2">
            <span className="font-medium text-zinc-100">Tip:</span> Use the navbar to open a section. Click the same
            tab again to return to <span className="font-medium text-zinc-100">Home</span>.
          </p>
          <p className="mb-2">
            Current setup — Dataset: <span className="text-zinc-100">{datasetLabel}</span>, Risk:{" "}
            <span className="text-zinc-100">{riskPretty}</span>, Initial Equity:{" "}
            <span className="text-zinc-100">{`₹${initialEquity.toLocaleString("en-IN")}`}</span>, Horizon:{" "}
            <span className="text-zinc-100">{timeHorizon} days</span>, Threshold:{" "}
            <span className="text-zinc-100">{threshold}%</span>.
          </p>
          <p className="text-zinc-400">
            Time inputs exist only in <span className="text-zinc-200">Quantum vs Classical</span> and{" "}
            <span className="text-zinc-200">Portfolio Evolution</span>. Threshold lives in{" "}
            <span className="text-zinc-200">Stress Testing</span>.
          </p>
        </div>
      </Card>
    </div>
  );

  // ---------- Page ----------
  return (
    <div className="flex min-h-screen bg-[#0b0f1a] text-gray-100">
      {/* Navbar is always shown */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar />

        {/* Home (no sidebar) */}
        {activeTab === null ? (
          <div className="flex-1 overflow-auto">{renderHome()}</div>
        ) : (
          // Section pages (no sidebar anymore)
          <div className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto px-5 py-6 md:py-8 space-y-6">
              {/* Section header */}
              <div className="bg-[#0f1422] border border-zinc-800/70 rounded-xl p-4">
                <h2 className="text-lg font-semibold tracking-tight">
                  {activeTab === "compare" && "Quantum vs Classical"}
                  {activeTab === "evolution" && "Portfolio Evolution"}
                  {activeTab === "insights" && "Quantum Insights"}
                  {activeTab === "stress" && "Stress Testing"}
                  {activeTab === "explain" && "Explain"}
                </h2>
                <p className="text-zinc-400 text-sm mt-1">
                  Dataset: <span className="text-zinc-200">{datasetLabel}</span>
                  {" • "}Risk: <span className="text-zinc-200">{riskPretty}</span>
                  {" • "}Hybrid: <span className="text-zinc-200">{useHybrid ? "On" : "Off"}</span>
                  {" • "}Init: <span className="text-zinc-200">{`₹${initialEquity.toLocaleString("en-IN")}`}</span>
                  {" • "}Horizon: <span className="text-zinc-200">{timeHorizon} days</span>
                  {" • "}Thresh: <span className="text-zinc-200">{threshold}%</span>
                </p>
              </div>

              {/* Section bodies */}
              {activeTab === "compare" && (
                <>
                  {/* Section-specific controls: Time + Rebalancing + Hybrid + Apply */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Card title="Time (days)">
                      <input
                        type="number"
                        min={1}
                        className="w-full bg-[#0b0f1a] border border-zinc-700 rounded-lg px-3 py-2"
                        value={timeHorizon}
                        onChange={(e) => dispatch(setTimeHorizon(Number(e.target.value) || 1))}
                      />
                    </Card>
                    <Card title="Rebalancing">
                      <select
                        className="bg-[#0b0f1a] border border-zinc-700 rounded-lg px-3 py-2 w-full"
                        value={rebalanceFreq}
                        onChange={(e) => setRebalanceFreq(e.target.value)}
                      >
                        <option>Monthly</option>
                        <option>Quarterly</option>
                      </select>
                    </Card>
                    <Card title="Hybrid (QAOA + Weights)">
                      <label className="inline-flex items-center gap-2 text-sm cursor-pointer select-none">
                        <input
                          type="checkbox"
                          className="accent-indigo-500 w-4 h-4"
                          checked={useHybrid}
                          onChange={(e) => setUseHybrid(e.target.checked)}
                        />
                        <span>{useHybrid ? "Enabled" : "Disabled"}</span>
                      </label>
                    </Card>
                    <Card title="Actions">
                      <button
                        onClick={handleApplyConstraints}
                        className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm disabled:opacity-60"
                        disabled={loading.qaoa || loading.alloc || loading.frontier}
                      >
                        {(loading.qaoa || loading.alloc || loading.frontier) ? "Applying..." : "Apply Constraints"}
                      </button>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Efficient Frontier */}
                    <Card title="Efficient Frontier">
                      <div className="h-[280px]">
                        {loading.frontier ? (
                          <Skeleton className="h-full w-full" />
                        ) : !frontier?.length ? (
                          <EmptyState title="No frontier yet" subtitle="Adjust constraints and click Apply." />
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={frontier} margin={{ top: 10, right: 15, left: 16, bottom: 8 }}>
                              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                              <XAxis dataKey="risk" stroke="#a1a1aa" tickMargin={6} />
                              <YAxis stroke="#a1a1aa" tickFormatter={(v) => `${Number(v).toFixed(1)}%`} tickMargin={6} width={64} />
                              <Tooltip
                                formatter={(v, n) => (n === "return" ? `${Number(v).toFixed(2)}%` : v)}
                                labelFormatter={(lab) => `Risk (σ): ${lab}`}
                                contentStyle={tooltipStyles.contentStyle}
                                labelStyle={tooltipStyles.labelStyle}
                                itemStyle={tooltipStyles.itemStyle}
                                wrapperStyle={tooltipStyles.wrapperStyle}
                              />
                              <Line type="monotone" dataKey="return" stroke="#7C3AED" strokeWidth={2} dot={{ r: 4 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                      <ChartCaption x="Portfolio Risk (σ)" y="Expected Return (%)" />
                    </Card>

                    {/* Sharpe Ratio */}
                    {showSharpe && (
                      <Card title="Sharpe Ratio Comparison">
                        <div className="h-[280px]">
                          {loading.sharpe ? (
                            <Skeleton className="h-full w-full" />
                          ) : !sharpeData?.length ? (
                            <EmptyState title="No Sharpe data" subtitle="Try applying constraints." />
                          ) : (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={sharpeData} margin={{ top: 10, right: 15, left: 10, bottom: 24 }}>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                                <XAxis dataKey="name" stroke="#a1a1aa" tickMargin={6} />
                                <YAxis stroke="#a1a1aa" domain={[0, "dataMax + 0.2"]} width={56} />
                                <Tooltip
                                  contentStyle={tooltipStyles.contentStyle}
                                  labelStyle={tooltipStyles.labelStyle}
                                  itemStyle={tooltipStyles.itemStyle}
                                  wrapperStyle={tooltipStyles.wrapperStyle}
                                />
                                <Bar dataKey="value" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                        <ChartCaption x="Model" y="Sharpe Ratio" />
                      </Card>
                    )}

                    {/* Portfolio Allocation */}
                    <Card title="Portfolio Allocation (Weights)">
                      <div className="h-[280px]">
                        {loading.alloc ? (
                          <Skeleton className="h-full w-full" />
                        ) : !alloc?.length ? (
                          <EmptyState title="No allocation yet" subtitle="Apply constraints to generate weights." />
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
                              <Tooltip
                                formatter={(v) => `${Number(v).toFixed(0)}%`}
                                contentStyle={tooltipStyles.contentStyle}
                                labelStyle={tooltipStyles.labelStyle}
                                itemStyle={tooltipStyles.itemStyle}
                                wrapperStyle={tooltipStyles.wrapperStyle}
                              />
                              <Legend
                                verticalAlign="bottom"
                                height={28}
                                wrapperStyle={{ color: "#a1a1aa", fontSize: 12 }}
                                iconSize={8}
                              />
                              <Pie
                                data={alloc}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={activeSlice === null ? 92 : 96}
                                paddingAngle={1}
                                isAnimationActive={false}
                                onMouseEnter={(_, i) => setActiveSlice(i)}
                                onMouseLeave={() => setActiveSlice(null)}
                                onTouchStart={(_, i) => setActiveSlice(i)}
                                onTouchEnd={() => setActiveSlice(null)}
                                label={false}
                              >
                                {alloc.map((_, i) => (
                                  <Cell
                                    key={i}
                                    fill={COLORS[i % COLORS.length]}
                                    fillOpacity={activeSlice === null ? 1 : activeSlice === i ? 1 : 0.95}
                                    stroke="#e5e7eb33"
                                    strokeWidth={activeSlice === i ? 2 : 1}
                                    style={{ transition: "all 120ms ease" }}
                                  />
                                ))}
                                <Label value={centerLabelText} position="center" fill="#e5e7eb" fontSize={12} />
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </Card>

                    {/* Portfolio Evolution */}
                    {showClassical && (
                      <Card title="Portfolio Evolution">
                        <div className="h-[280px]">
                          {loading.evo ? (
                            <Skeleton className="h-full w-full" />
                          ) : !evolution?.length ? (
                            <EmptyState title="No evolution yet" subtitle="Change rebalancing or apply constraints." />
                          ) : (
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={evolution} margin={{ top: 10, right: 12, left: 24, bottom: 8 }}>
                                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                                <XAxis dataKey="time" stroke="#a1a1aa" tickMargin={6} />
                                <YAxis stroke="#a1a1aa" tickFormatter={(v) => currency(v)} tickMargin={6} width={88} />
                                <Tooltip
                                  formatter={(v) => currency(v)}
                                  contentStyle={tooltipStyles.contentStyle}
                                  labelStyle={tooltipStyles.labelStyle}
                                  itemStyle={tooltipStyles.itemStyle}
                                  wrapperStyle={tooltipStyles.wrapperStyle}
                                />
                                <Legend />
                                <Line type="monotone" dataKey="Quantum" stroke="#7C3AED" strokeWidth={2} dot={false} />
                                <Line type="monotone" dataKey="Classical" stroke="#3B82F6" strokeWidth={2} dot={false} />
                              </LineChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                        <ChartCaption x="Time (days)" y="Portfolio Value (₹)" />
                      </Card>
                    )}
                  </div>
                </>
              )}

              {activeTab === "evolution" && (
                <>
                  {/* Time control here too */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Card title="Time (days)">
                      <input
                        type="number"
                        min={1}
                        className="w-full bg-[#0b0f1a] border border-zinc-700 rounded-lg px-3 py-2"
                        value={timeHorizon}
                        onChange={(e) => dispatch(setTimeHorizon(Number(e.target.value) || 1))}
                      />
                    </Card>
                    <Card title="Rebalancing">
                      <select
                        className="bg-[#0b0f1a] border border-zinc-700 rounded-lg px-3 py-2 w-full"
                        value={rebalanceFreq}
                        onChange={(e) => setRebalanceFreq(e.target.value)}
                      >
                        <option>Monthly</option>
                        <option>Quarterly</option>
                      </select>
                    </Card>
                    <Card title="Hybrid (QAOA + Weights)">
                      <label className="inline-flex items-center gap-2 text-sm cursor-pointer select-none">
                        <input
                          type="checkbox"
                          className="accent-indigo-500 w-4 h-4"
                          checked={useHybrid}
                          onChange={(e) => setUseHybrid(e.target.checked)}
                        />
                        <span>{useHybrid ? "Enabled" : "Disabled"}</span>
                      </label>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    <Card title="Portfolio Value Over Time">
                      <div className="h-[320px]">
                        {loading.evo ? (
                          <Skeleton className="h-full w-full" />
                        ) : !evolution?.length ? (
                          <EmptyState title="No evolution yet" subtitle="Adjust time/rebalancing/hybrid and try again." />
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={evolution} margin={{ top: 10, right: 12, left: 24, bottom: 8 }}>
                              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                              <XAxis dataKey="time" stroke="#a1a1aa" tickMargin={6} />
                              <YAxis stroke="#a1a1aa" tickFormatter={(v) => currency(v)} tickMargin={6} width={88} />
                              <Tooltip
                                formatter={(v) => currency(v)}
                                contentStyle={tooltipStyles.contentStyle}
                                labelStyle={tooltipStyles.labelStyle}
                                itemStyle={tooltipStyles.itemStyle}
                                wrapperStyle={tooltipStyles.wrapperStyle}
                              />
                              <Legend />
                              <Line type="monotone" dataKey="Quantum" stroke="#7C3AED" strokeWidth={2} />
                              <Line type="monotone" dataKey="Classical" stroke="#3B82F6" strokeWidth={2} />
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                      <ChartCaption x="Time (days)" y="Portfolio Value (₹)" />
                    </Card>
                  </div>
                </>
              )}

              {activeTab === "insights" && (
                <div className="grid grid-cols-1 gap-6">
                  <InsightsPanel
                    loading={loading.frontier || loading.alloc || loading.evo}
                    topBits={topBits}
                    sharpeData={sharpeData}
                    alloc={alloc}
                    evolution={evolution}
                    useHybrid={useHybrid}
                  />
                </div>
              )}

              {activeTab === "stress" && (
                <div className="grid grid-cols-1 gap-6">
                  <Card title="Stress Controls (incl. Threshold)">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <label className="block text-zinc-300 mb-1">Interest Rates (+bps)</label>
                        <input
                          type="range" min="0" max="400"
                          value={stress.ratesBps}
                          onChange={(e) => setStress({ ...stress, ratesBps: Number(e.target.value) })}
                          className="w-full accent-indigo-500"
                        />
                        <div className="text-zinc-400 mt-1">{stress.ratesBps} bps</div>
                      </div>
                      <div>
                        <label className="block text-zinc-300 mb-1">Oil Price Shock (%)</label>
                        <input
                          type="range" min="-20" max="30"
                          value={stress.oilPct}
                          onChange={(e) => setStress({ ...stress, oilPct: Number(e.target.value) })}
                          className="w-full accent-indigo-500"
                        />
                        <div className="text-zinc-400 mt-1">{stress.oilPct}%</div>
                      </div>
                      <div>
                        <label className="block text-zinc-300 mb-1">Tech Sector Shock (%)</label>
                        <input
                          type="range" min="-30" max="10"
                          value={stress.techPct}
                          onChange={(e) => setStress({ ...stress, techPct: Number(e.target.value) })}
                          className="w-full accent-indigo-500"
                        />
                        <div className="text-zinc-400 mt-1">{stress.techPct}%</div>
                      </div>
                      <div>
                        <label className="block text-zinc-300 mb-1">FX Shock (±%)</label>
                        <input
                          type="range" min="-10" max="10"
                          value={stress.fxPct}
                          onChange={(e) => setStress({ ...stress, fxPct: Number(e.target.value) })}
                          className="w-full accent-indigo-500"
                        />
                        <div className="text-zinc-400 mt-1">{stress.fxPct}%</div>
                      </div>

                      {/* Editable Threshold here */}
                      <div className="md:col-span-2">
                        <label className="block text-zinc-300 mb-1">Selection Threshold (%)</label>
                        <input
                          type="range" min="0" max="100"
                          value={threshold}
                          onChange={(e) => dispatch(setThreshold(Number(e.target.value)))}
                          className="w-full accent-indigo-500"
                        />
                        <div className="text-zinc-400 mt-1">{threshold}%</div>
                      </div>
                    </div>
                  </Card>

                  <Card title="Stress Result (Simulated NAV)">
                    <div className="h-[280px]">
                      {loading.stress ? (
                        <Skeleton className="h-full w-full" />
                      ) : !stressed?.length ? (
                        <EmptyState title="No stress result yet" subtitle="Move the sliders to simulate shocks." />
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stressed} margin={{ top: 10, right: 12, left: 24, bottom: 8 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                            <XAxis dataKey="name" stroke="#a1a1aa" tickMargin={6} />
                            <YAxis stroke="#a1a1aa" tickFormatter={(v) => currency(v)} tickMargin={6} width={88} />
                            <Tooltip
                              formatter={(v) => currency(v)}
                              contentStyle={tooltipStyles.contentStyle}
                              labelStyle={tooltipStyles.labelStyle}
                              itemStyle={tooltipStyles.itemStyle}
                              wrapperStyle={tooltipStyles.wrapperStyle}
                            />
                            <Bar dataKey="value" fill="#F59E0B" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                    <ChartCaption x="Model" y="NAV (₹)" />
                  </Card>
                </div>
              )}

              {activeTab === "explain" && (
                <Card title="Top Measured Portfolios (Demo)">
                  {!topBits?.length ? (
                    <EmptyState title="No solutions yet" subtitle="Apply constraints to compute candidate bitstrings." />
                  ) : (
                    <div className="overflow-auto border border-zinc-800/70 rounded-xl">
                      <table className="w-full text-sm">
                        <thead className="bg-[#0f1422] text-zinc-300">
                          <tr>
                            <th className="text-left p-3">Bitstring</th>
                            <th className="text-right p-3">Prob.</th>
                            <th className="text-right p-3">Exp. Return</th>
                            <th className="text-right p-3">Risk</th>
                            <th className="text-left p-3">Constraints</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topBits.map((r, i) => (
                            <tr key={i} className="border-t border-zinc-800/50">
                              <td className="p-3 font-mono">{r.bits}</td>
                              <td className="p-3 text-right">{percent(r.p * 100, 1)}</td>
                              <td className="p-3 text-right">{percent(r.expRet, 1)}</td>
                              <td className="p-3 text-right">{percent(r.risk, 1)}</td>
                              <td className="p-3">{r.constraints}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </Card>
              )}

              {/* Footer / Exports */}
              {showStress && (
                <div className="pt-2 pb-8 flex flex-wrap gap-2">
                  <button
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition"
                    onClick={() =>
                      downloadJSON("results.json", { frontier, sharpeData, alloc, evolution, topBits, stressed })
                    }
                  >
                    Export JSON
                  </button>
                  <button
                    className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition border border-zinc-700"
                    onClick={() => downloadCSV("top_solutions.csv", topBits)}
                  >
                    Export Top Solutions (CSV)
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
