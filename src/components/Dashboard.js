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
} from "recharts";

const Card = ({ title, children }) => (
  <div className="bg-[#0f1422] border border-zinc-800/70 rounded-2xl p-4 shadow-sm">
    {title ? (
      <h2 className="text-[15px] md:text-lg font-semibold tracking-tight mb-2 text-zinc-100">
        {title}
      </h2>
    ) : null}
    {children}
  </div>
);

const COLORS = ["#7C3AED", "#3B82F6", "#10B981", "#F59E0B"];

const Dashboard = () => {
  const { dataset, risk, options } = useSelector((state) => state.ui); // <-- fixed 'option' -> 'options'
  const [activeTab, setActiveTab] = useState("compare"); // compare | evolution | insights | stress

  // ---- Data (demo) ------------------------------------------------------------
  // Scale the efficient frontier a bit with the risk slider so the curve responds.
  const efficientFrontier = useMemo(() => {
    const base = [
      { risk: 1, return: 2 },
      { risk: 2, return: 4 },
      { risk: 3, return: 5.5 },
      { risk: 4, return: 6.5 },
      { risk: 5, return: 7 },
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
    { name: "Quantum", value: 0.9 },
    { name: "Classical", value: 0.7 },
  ];

  const portfolioEvolution = [
    { time: "T1", Quantum: 100, Classical: 90 },
    { time: "T2", Quantum: 120, Classical: 100 },
    { time: "T3", Quantum: 140, Classical: 110 },
    { time: "T4", Quantum: 160, Classical: 120 },
  ];

  // ---- Option toggles from Sidebar -------------------------------------------
  // If no options selected, show everything.
  const showSharpe = !options?.length || options.includes("Sharpe Ratio");
  const showStress = !options?.length || options.includes("Stress Testing");
  const showClassical = !options?.length || options.includes("Classical Comparison");

  // UI labels
  const datasetLabel =
    dataset === "nifty50"
      ? "NIFTY 50"
      : dataset === "crypto"
      ? "Crypto"
      : dataset === "nasdaq"
      ? "NASDAQ"
      : dataset || "Select Dataset";

  // ---- Render -----------------------------------------------------------------
  return (
    <div className="flex h-screen bg-[#0b0f1a] text-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <div className="px-5 pt-5 pb-8 overflow-y-auto">
          {/* Header row */}
          <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                Quantum-Inspired Portfolio Optimization with QAOA
              </h1>
              <p className="text-zinc-400 text-sm">
                Dataset: <span className="text-zinc-200">{datasetLabel}</span> • Risk Preference:{" "}
                <span className="text-zinc-200">{risk}</span>
              </p>
            </div>

            {/* Simple Tabs (no external UI lib) */}
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
                    ${activeTab === t.key ? "bg-zinc-800/60" : "hover:bg-zinc-800/30"}
                  `}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          {activeTab === "compare" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Efficient Frontier */}
              <Card title="Efficient Frontier">
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={efficientFrontier} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                    <XAxis dataKey="risk" stroke="#a1a1aa" />
                    <YAxis stroke="#a1a1aa" />
                    <Tooltip contentStyle={{ background: "#0b0f1a", border: "1px solid #27272a" }} />
                    <Line type="monotone" dataKey="return" stroke="#7C3AED" strokeWidth={2} dot />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              {/* Sharpe Ratio (only if opted or none selected) */}
              {showSharpe && (
                <Card title="Sharpe Ratio Comparison">
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={sharpeRatio} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                      <XAxis dataKey="name" stroke="#a1a1aa" />
                      <YAxis stroke="#a1a1aa" />
                      <Tooltip contentStyle={{ background: "#0b0f1a", border: "1px solid #27272a" }} />
                      <Bar dataKey="value" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              )}

              {/* Portfolio Allocation */}
              <Card title="Portfolio Allocation">
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Tooltip contentStyle={{ background: "#0b0f1a", border: "1px solid #27272a" }} />
                    <Legend />
                    <Pie
                      data={portfolioAlloc}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={2}
                    >
                      {portfolioAlloc.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </Card>

              {/* Portfolio Evolution (if classical comparison is on or none selected) */}
              {showClassical && (
                <Card title="Portfolio Evolution">
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={portfolioEvolution} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                      <XAxis dataKey="time" stroke="#a1a1aa" />
                      <YAxis stroke="#a1a1aa" />
                      <Tooltip contentStyle={{ background: "#0b0f1a", border: "1px solid #27272a" }} />
                      <Legend />
                      <Line type="monotone" dataKey="Quantum" stroke="#7C3AED" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="Classical" stroke="#3B82F6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              )}
            </div>
          )}

          {activeTab === "evolution" && (
            <div className="grid grid-cols-1 gap-6">
              <Card title="Portfolio Value Over Time">
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={portfolioEvolution}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                    <XAxis dataKey="time" stroke="#a1a1aa" />
                    <YAxis stroke="#a1a1aa" />
                    <Tooltip contentStyle={{ background: "#0b0f1a", border: "1px solid #27272a" }} />
                    <Legend />
                    <Line type="monotone" dataKey="Quantum" stroke="#7C3AED" strokeWidth={2} />
                    <Line type="monotone" dataKey="Classical" stroke="#3B82F6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </div>
          )}

          {activeTab === "insights" && (
            <div className="grid grid-cols-1 gap-6">
              <Card title="Quantum Insights">
                <div className="text-sm text-zinc-300 space-y-2 leading-relaxed">
                  <p>
                    • QAOA achieves a higher Sharpe for similar risk budgets. Increase mixer depth
                    or shots to probe convergence.
                  </p>
                  <p>
                    • Allocation tilts toward lower-volatility buckets while preserving sector diversification.
                  </p>
                </div>
              </Card>
            </div>
          )}

          {activeTab === "stress" && (
            <div className="grid grid-cols-1 gap-6">
              <Card title="Stress Testing">
                <div className="text-sm text-zinc-300 space-y-2 leading-relaxed">
                  <p>Run scenario shocks: +200 bps rates, oil +15%, tech −8%, FX ±3%.</p>
                  <p>Hook this to your backend when ready; the UI is already blocked out.</p>
                </div>
              </Card>
            </div>
          )}

          {/* Optional footer export button */}
          {showStress && (
            <div className="mt-6">
              <button className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition">
                Export Results
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
