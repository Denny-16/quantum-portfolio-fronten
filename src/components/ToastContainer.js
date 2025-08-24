import { useDispatch, useSelector } from "react-redux";
import { removeToast } from "../store/uiSlice";

export default function ToastContainer() {
  const toasts = useSelector(s => s.ui.toasts);
  const dispatch = useDispatch();

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-50">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`rounded-2xl px-4 py-3 shadow-lg text-sm
                     ${t.type === "error" ? "bg-red-600 text-white"
                     : t.type === "success" ? "bg-green-600 text-white"
                     : "bg-gray-800 text-white"}`}
          onClick={() => dispatch(removeToast(t.id))}
          role="status"
          aria-live="polite"
        >
          {t.msg}
        </div>
      ))}
    </div>
  );
}
