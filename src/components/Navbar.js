import React from "react";

function Navbar() {
  return (
    <nav className="w-full bg-white shadow-md px-10 py-3 flex justify-between items-center">
      <h1 className="text-xl font-bold text-indigo-600">
        Quantum Portfolio Optimizer
      </h1>
      <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition">
        Run QAOA
      </button>
    </nav>
  );
}

export default Navbar;
