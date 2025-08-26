import React from "react";
import Dashboard from "./components/Dashboard";
import ToastContainer from "./components/ToastContainer";
import AboutModal from "./components/AboutModal";

export default function App() {
  return (
    <>
      <Dashboard />
      <ToastContainer />
      <AboutModal />
    </>
  );
}
