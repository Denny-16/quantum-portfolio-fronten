// src/components/AboutModal.js
import { useDispatch, useSelector } from "react-redux";
import { closeAbout } from "../store/uiSlice";

export default function AboutModal() {
  const dispatch = useDispatch();
  const open = useSelector((s) => s.ui.isAboutOpen);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[#0f1422] border border-zinc-800/70 rounded-2xl p-6 w-[90%] max-w-lg">
        <h2 className="text-lg font-semibold mb-2">About</h2>
        <p className="text-sm text-zinc-300">
          Quantum Portfolio Optimizer (demo) — UI for QAOA-based selection + classical weighting.
        </p>
        <div className="mt-4 text-right">
          <button
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500"
            onClick={() => dispatch(closeAbout())}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
