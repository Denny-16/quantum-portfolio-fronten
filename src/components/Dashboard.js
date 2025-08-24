// src/components/Dashboard.js
import React, { useMemo, useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useSelector } from "react-redux";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
  CartesianGrid,
  Label,
} from "recharts";

const Card = ({ title, children, className = "" }) => (
  <div className={`bg-[#0f1422] border border-zinc-800/70 rounded-2xl p-4 shadow-sm ${className}`}>
    {title ? (
      <h2 className="text-[15px] md:text-lg font-semibold tracking-tight mb-2 text-zinc-100">
        {title}
      </h2>
    ) : null}
    {children}
  </div>
);

// Tiny caption below charts to explain axes without crowding the plot
const ChartCaption = ({ x, y }) => (
  <div className="mt-2 text-[11px] text-zinc-400">
    <span className="mr-6">X: {x}</span>
    <span>Y: {y}</span>
  </div>
);

// Colors for charts
const COLORS = ["#7C3AED", "#3B82F6", "#10B981", "#F59E0B"];

// Simple formatters for consistent labeling/tooltip units
const currency = (v) => `₹${Number(v).toLocaleString("en-IN")}`;
const percent = (v, digits = 0) => `${Number(v).toFixed(digits)}%`;

// High-contrast tooltip styles (works well on dark backgrounds)
const tooltipStyles = {
  contentStyle: {
    background: "#111827", // a bit brighter than page bg
    border: "1px solid #6366F1",
    borderRadius: 8,
    boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  },
  labelStyle: { color: "#C7D2FE", fontSize: 12 },
  itemStyle: { color: "#E5E7EB", fontSize: 12 },
  wrapperStyle: { zIndex: 50 }, // stay on top
};

const Dashboard = () => {
  const { dataset, risk, options } = useSelector((state) => state.ui);
  const [activeTab, setActiveTab] = useState("compare"); // compare | evolution | insights | stress
  const [activeSlice, setActiveSlice] = useState(null); // for pie hover/touch highlight

  // -------------------- DUMMY DATA --------------------
  const efficientFrontier = useMemo(() => {
    const base = [
      { risk: 5, return: 6 },
      { risk: 8, return: 8 },
      { risk: 11, return: 9.5 },
      { risk: 14, return: 10.2 },
      { risk: 17, return: 10.5 },
    ];
    const factor = 0.8 + Number(risk || 0) * 0.05; // risk 0..10 => 0.8..1.3
    return base.map((p) => ({ ...p, return: +(p.return * factor).toFixed(2) }));
  }, [risk]);

  const portfolioAlloc = [
    { name: "QAOA-based", value: 40 },
    { name: "Classical Max-Sh", value: 25 },
    { name: "Equal-Weight", value: 20 },
    { name: "SPY", value: 15 },
  ];

  const sharpeRatio = [
    { name: "Quantum", value: 0.92 },
    { name: "Classical", value: 0.74 },
  ];

  const portfolioEvolution = [
    { time: "T1", Quantum: 100000, Classical: 100000 },
    { time: "T2", Quantum: 106500, Classical: 103200 },
    { time: "T3", Quantum: 113800, Classical: 107900 },
    { time: "T4", Quantum: 121900, Classical: 112100 },
  ];

  const qaoaHistogram = [
    { bitstring: "10101", p: 0.28 },
    { bitstring: "11100", p: 0.21 },
    { bitstring: "11010", p: 0.17 },
    { bitstring: "10011", p: 0.14 },
    { bitstring: "01101", p: 0.11 },
    { bitstring: "00111", p: 0.09 },
  ];

  // -------------------- Sidebar Toggles --------------------
  const showSharpe = !options?.length || options.includes("Sharpe Ratio");
  const showStress = !options?.length || options.includes("Stress Testing");
  const showClassical = !options?.length || options.includes("Classical Comparison");

  // -------------------- Labels --------------------
  const datasetLabel =
    dataset === "nifty50"
      ? "NIFTY 50"
      : dataset === "crypto"
      ? "Crypto"
      : dataset === "nasdaq"
      ? "NASDAQ"
      : dataset || "Select Dataset";

  // Dynamic center label for pie (shows hovered slice name + %)
  const centerLabelText =
    activeSlice === null
      ? "Weights (%)"
      : `${portfolioAlloc[activeSlice]?.name ?? ""} · ${percent(portfolioAlloc[activeSlice]?.value || 0, 0)}`;

  // -------------------- UI --------------------
  return (
    <div className="flex min-h-screen bg-[#0b0f1a] text-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar />

        {/* Sticky header + tabs */}
        <div className="sticky top-0 z-10 bg-[#0b0f1a]/80 backdrop-blur supports-[backdrop-filter]:bg-[#0b0f1a]/60 border-b border-zinc-800/60">
          <div className="max-w-7xl mx-auto px-5 py-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="space-y-1">
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                  Quantum-Inspired Portfolio Optimization with QAOA
                </h1>
                <p className="text-zinc-400 text-sm">
                  Dataset: <span className="text-zinc-200">{datasetLabel}</span> • Risk Preference:{" "}
                  <span className="text-zinc-200">{risk}</span>
                </p>
              </div>

              {/* Tabs */}
              <div className="bg-[#0f1422] border border-zinc-800/70 rounded-xl p-1 flex">
                {[
                  { key: "compare", label: "Quantum vs Classical" },
                  { key: "evolution", label: "Portfolio Evolution" },
                  { key: "insights", label: "Quantum Insights" },
                  { key: "stress", label: "Stress Testing" },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={`px-3 md:px-4 py-2 rounded-lg text-sm transition
                    ${activeTab === t.key ? "bg-zinc-800/60" : "hover:bg-zinc-800/30"}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-5 py-6 md:py-8 space-y-6">
            {/* -------------------- COMPARE TAB -------------------- */}
            {activeTab === "compare" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Efficient Frontier — no in-chart axis labels; caption below */}
                <Card title="Efficient Frontier" className="h-full">
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={efficientFrontier} margin={{ top: 10, right: 15, left: 16, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                        <XAxis dataKey="risk" stroke="#a1a1aa" tickMargin={6} />
                        <YAxis
                          stroke="#a1a1aa"
                          tickFormatter={(v) => `${Number(v).toFixed(1)}%`}
                          tickMargin={6}
                          width={64} // ensure ticks fit comfortably
                        />
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
                  </div>
                  <ChartCaption x="Portfolio Risk (σ)" y="Expected Return (%)" />
                </Card>

                {/* Sharpe Ratio */}
                {showSharpe && (
                  <Card title="Sharpe Ratio Comparison" className="h-full">
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sharpeRatio} margin={{ top: 10, right: 15, left: 10, bottom: 24 }}>
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
                    </div>
                    <ChartCaption x="Model" y="Sharpe Ratio" />
                  </Card>
                )}

                {/* Portfolio Allocation (Weights) — fixed hover/touch darkness + strong tooltip */}
                <Card title="Portfolio Allocation (Weights)" className="h-full">
                  <div className="h-[280px]">
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
                          data={portfolioAlloc}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={activeSlice === null ? 92 : 96} // slight pop on hover
                          paddingAngle={1}
                          isAnimationActive={false}
                          onMouseEnter={(_, i) => setActiveSlice(i)}
                          onMouseLeave={() => setActiveSlice(null)}
                          onTouchStart={(_, i) => setActiveSlice(i)}
                          onTouchEnd={() => setActiveSlice(null)}
                          label={false}
                        >
                          {portfolioAlloc.map((_, i) => (
                            <Cell
                              key={i}
                              fill={COLORS[i % COLORS.length]}
                              // keep visibility high on hover instead of darkening
                              fillOpacity={activeSlice === null ? 1 : activeSlice === i ? 1 : 0.95}
                              stroke="#e5e7eb33" // subtle outline for all
                              strokeWidth={activeSlice === i ? 2 : 1}
                              style={{ transition: "all 120ms ease" }}
                            />
                          ))}
                          <Label value={centerLabelText} position="center" fill="#e5e7eb" fontSize={12} />
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                {/* Portfolio Evolution — increased left margin + YAxis width to avoid clipping */}
                {showClassical && (
                  <Card title="Portfolio Evolution" className="h-full">
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={portfolioEvolution} margin={{ top: 10, right: 12, left: 20, bottom: 8 }}>
                          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                          <XAxis dataKey="time" stroke="#a1a1aa" tickMargin={6} />
                          <YAxis stroke="#a1a1aa" tickFormatter={(v) => currency(v)} tickMargin={6} width={84} />
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
                    </div>
                    <ChartCaption x="Time (rebalance periods)" y="Portfolio Value (₹)" />
                  </Card>
                )}
              </div>
            )}

            {/* -------------------- EVOLUTION TAB -------------------- */}
            {activeTab === "evolution" && (
              <div className="grid grid-cols-1 gap-6">
                <Card title="Portfolio Value Over Time">
                  <div className="h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={portfolioEvolution} margin={{ top: 10, right: 12, left: 24, bottom: 8 }}>
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
                  </div>
                  <ChartCaption x="Time (rebalance periods)" y="Portfolio Value (₹)" />
                </Card>
              </div>
            )}

            {/* -------------------- INSIGHTS TAB -------------------- */}
            {activeTab === "insights" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card title="Quantum Insights (Notes)">
                  <div className="text-sm text-zinc-300 space-y-2 leading-relaxed">
                    <p>• QAOA achieves a higher Sharpe for similar risk budgets in this demo.</p>
                    <p>• Allocation tilts toward lower-volatility buckets while preserving sector diversification.</p>
                    <p>• Increase mixer depth or shots to probe convergence (placeholder for real runs).</p>
                  </div>
                </Card>

                <Card title="QAOA Measurement Histogram (Demo)">
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={qaoaHistogram} margin={{ top: 10, right: 15, left: 16, bottom: 24 }}>
                        <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                        <XAxis dataKey="bitstring" stroke="#a1a1aa" tickMargin={6} />
                        <YAxis
                          stroke="#a1a1aa"
                          tickFormatter={(v) => percent(v * 100, 0)}
                          domain={[0, "dataMax + 0.05"]}
                          width={64}
                        />
                        <Tooltip
                          formatter={(v, n) => (n === "p" ? percent(v * 100, 2) : v)}
                          contentStyle={tooltipStyles.contentStyle}
                          labelStyle={tooltipStyles.labelStyle}
                          itemStyle={tooltipStyles.itemStyle}
                          wrapperStyle={tooltipStyles.wrapperStyle}
                        />
                        <Bar dataKey="p" fill="#10B981" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <ChartCaption x="Measured Bitstrings" y="Probability (%)" />
                </Card>
              </div>
            )}

            {/* -------------------- STRESS TAB -------------------- */}
            {activeTab === "stress" && (
              <div className="grid grid-cols-1 gap-6">
                <Card title="Stress Testing (Scenario Placeholders)">
                  <div className="text-sm text-zinc-300 space-y-2 leading-relaxed">
                    <p>Run scenario shocks: +200 bps rates, oil +15%, tech −8%, FX ±3%.</p>
                    <p>Hook this to your backend when ready; the UI is already blocked out.</p>
                  </div>
                </Card>
              </div>
            )}

            {/* Footer action */}
            {showStress && (
              <div className="pt-2 pb-8">
                <button className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition">
                  Export Results
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
