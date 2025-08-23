import React from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function Dashboard() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="p-6 bg-gray-50 flex-1 overflow-y-auto">
          <h2 className="text-2xl font-semibold mb-4">Portfolio Overview</h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white shadow rounded-xl p-4">Sharpe Ratio</div>
            <div className="bg-white shadow rounded-xl p-4">Risk</div>
            <div className="bg-white shadow rounded-xl p-4">Return</div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
