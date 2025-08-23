import React from "react";
import { useDispatch } from "react-redux";
import { toggleSidebar } from "../store/uiSlice";

const Navbar = () => {
  const dispatch = useDispatch();

  return (
    <div className="flex items-center justify-between bg-gray-900 text-white p-4 shadow-md">
      {/* Left: Logo + Title */}
      <div className="flex items-center gap-2">
        {/* Sidebar toggle button (only visible on mobile) */}
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="md:hidden p-2 rounded-lg hover:bg-gray-700"
        >
          {/* Simple Menu icon (3 bars) */}
          <div className="space-y-1">
            <div className="w-6 h-0.5 bg-white"></div>
            <div className="w-6 h-0.5 bg-white"></div>
            <div className="w-6 h-0.5 bg-white"></div>
          </div>
        </button>

        <h1 className="text-xl font-bold">Quantum Portfolio Optimizer</h1>
      </div>

      {/* Right: User / Settings */}
      <div className="flex items-center gap-4">
        <button className="px-4 py-2 border border-white rounded-lg hover:bg-white hover:text-gray-900 transition">
          Login
        </button>
      </div>
    </div>
  );
};

export default Navbar;
