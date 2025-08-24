import { useDispatch, useSelector } from "react-redux";
import { closeAbout } from "../store/uiSlice";

export default function AboutModal() {
  const open = useSelector(s => s.ui.isAboutOpen);
  const dispatch = useDispatch();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => dispatch(closeAbout())} />
      <div className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-xl max-w-lg w-full p-6">
        <h2 className="text-xl font-semibold">About: Quantum Portfolio Optimizer</h2>
        <div className="mt-3 text-sm text-gray-600 dark:text-gray-300 space-y-2">
          <p><strong>Classical Frontier</strong> plots portfolios by risk vs return.</p>
          <p><strong>QAOA</strong> maps the selection/weighting to a QUBO and searches optimal parameters.</p>
          <p>Use <em>Compare</em> and <em>Evolution</em> tabs to see performance and bit selections.</p>
        </div>
        <div className="mt-5 flex justify-end">
          <button className="px-3 py-2 rounded-xl bg-gray-200 dark:bg-neutral-800" onClick={() => dispatch(closeAbout())}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
