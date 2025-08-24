import React from "react";
import Dashboard from "./components/Dashboard.js";
import ToastContainer from "./components/ToastContainer.js";
import AboutModal from "./components/AboutModal.js";
export default function App() {
  return (
    <div className="min-h-screen bg-[#0b1020] text-white">
      <Dashboard />
      <ToastContainer />
      <AboutModal />
    </div>
  );
}
