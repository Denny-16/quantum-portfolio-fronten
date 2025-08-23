import { useDispatch, useSelector } from "react-redux";
import { setDataset, setRisk, toggleOption } from "../store/uiSlice";

export default function Sidebar() {
  const dispatch = useDispatch();
  const { dataset, risk, options } = useSelector((state) => state.ui);

  return (
    <div className="w-64 bg-white shadow-lg p-4 rounded-2xl flex flex-col gap-6">
      {/* Dataset Selection */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Dataset</h2>
        <select
          value={dataset}
          onChange={(e) => dispatch(setDataset(e.target.value))}
          className="w-full border rounded-xl p-2"
        >
          <option value="">Select Dataset</option>
          <option value="nifty50">Nifty 50</option>
          <option value="crypto">Crypto</option>
          <option value="nasdaq">NASDAQ</option>
        </select>
      </div>

      {/* Constraints */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Constraints</h2>
        <label className="text-sm">Risk Preference: {risk}</label>
        <input
          type="range"
          min="0"
          max="10"
          value={risk}
          onChange={(e) => dispatch(setRisk(Number(e.target.value)))}
          className="w-full"
        />
      </div>

      {/* Options */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Options</h2>
        <div className="flex flex-col gap-2">
          {["Sharpe Ratio", "Stress Testing", "Classical Comparison"].map(
            (label) => (
              <label key={label} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={options.includes(label)}
                  onChange={() => dispatch(toggleOption(label))}
                />
                {label}
              </label>
            )
          )}
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={() => console.log("Exporting results...")}
        className="mt-auto w-full bg-blue-600 text-white py-2 px-4 rounded-xl hover:bg-blue-700 transition"
      >
        Export Results
      </button>
    </div>
  );
}
