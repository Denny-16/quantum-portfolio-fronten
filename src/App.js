import React from "react";
import Dashboard from "./components/Dashboard";
import ToastContainer from "./components/ToastContainer";
import AboutModal from "./components/AboutModal";

export default function App() {
  return (
    <div className="min-h-screen bg-[#0b1020] text-white">
      <Dashboard />
      <ToastContainer />
      <AboutModal />
    </div>
  );
}
