// src/components/Dashboard.js
import React from "react";
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
} from "recharts";

const Dashboard = () => {
  const { dataset, risk, option } = useSelector((state) => state.ui);

  // ⚡ Dummy data (replace with backend API later)
  const efficientFrontier = [
    { risk: 1, return: 2 },
    { risk: 2, return: 4 },
    { risk: 3, return: 5.5 },
    { risk: 4, return: 6.5 },
    { risk: 5, return: 7 },
  ];

  const portfolioAlloc = [
    { name: "QAOA-based", value: 40 },
    { name: "Classical Max-Sh", value: 25 },
    { name: "Equal-Weight", value: 20 },
    { name: "SPY", value: 15 },
  ];
  const COLORS = ["#7C3AED", "#3B82F6", "#10B981", "#F59E0B"];

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

  return (
    <div className="flex h-screen bg-gray-950 text-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <Navbar />

        <div className="p-6 grid grid-cols-2 gap-6">
          {/* Efficient Frontier */}
          <div className="bg-gray-900 p-4 rounded-2xl shadow">
            <h2 className="text-lg font-semibold mb-2">Efficient Frontier</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={efficientFrontier}>
                <XAxis dataKey="risk" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip />
                <Line type="monotone" dataKey="return" stroke="#3B82F6" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Sharpe Ratio */}
          <div className="bg-gray-900 p-4 rounded-2xl shadow">
            <h2 className="text-lg font-semibold mb-2">Sharpe Ratio Comparison</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={sharpeRatio}>
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip />
                <Bar dataKey="value" fill="#7C3AED" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Portfolio Allocation */}
          <div className="bg-gray-900 p-4 rounded-2xl shadow">
            <h2 className="text-lg font-semibold mb-2">Portfolio Allocation</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={portfolioAlloc}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {portfolioAlloc.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Portfolio Evolution */}
          <div className="bg-gray-900 p-4 rounded-2xl shadow">
            <h2 className="text-lg font-semibold mb-2">Portfolio Evolution</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={portfolioEvolution}>
                <XAxis dataKey="time" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip />
                <Line type="monotone" dataKey="Quantum" stroke="#7C3AED" />
                <Line type="monotone" dataKey="Classical" stroke="#3B82F6" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
