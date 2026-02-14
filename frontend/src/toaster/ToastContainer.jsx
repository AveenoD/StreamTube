import { useEffect, useState } from "react";
import { useToastContext } from "./ToastContext";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  X
} from "lucide-react";

// ── Config for each toast type ────────────────────────────────
const TOAST_STYLES = {
  success: {
    container: "bg-white border-l-4 border-emerald-500 shadow-[0_8px_30px_rgba(16,185,129,0.15)]",
    icon:      <CheckCircle2 size={18} className="text-emerald-500 flex-shrink-0" strokeWidth={2.5} />,
    title:     "text-emerald-600",
    bar:       "bg-emerald-500",
  },
  error: {
    container: "bg-white border-l-4 border-red-500 shadow-[0_8px_30px_rgba(239,68,68,0.15)]",
    icon:      <XCircle size={18} className="text-red-500 flex-shrink-0" strokeWidth={2.5} />,
    title:     "text-red-600",
    bar:       "bg-red-500",
  },
  warning: {
    container: "bg-white border-l-4 border-amber-400 shadow-[0_8px_30px_rgba(251,191,36,0.15)]",
    icon:      <AlertTriangle size={18} className="text-amber-500 flex-shrink-0" strokeWidth={2.5} />,
    title:     "text-amber-600",
    bar:       "bg-amber-400",
  },
  info: {
    container: "bg-white border-l-4 border-indigo-500 shadow-[0_8px_30px_rgba(99,102,241,0.15)]",
    icon:      <Info size={18} className="text-indigo-500 flex-shrink-0" strokeWidth={2.5} />,
    title:     "text-indigo-600",
    bar:       "bg-indigo-500",
  },
};

// ── Single Toast Item ─────────────────────────────────────────
function ToastItem({ toast, onRemove }) {
  const [visible, setVisible]   = useState(false);   // entrance
  const [leaving, setLeaving]   = useState(false);   // exit
  const [progress, setProgress] = useState(100);     // progress bar

  const style = TOAST_STYLES[toast.type] || TOAST_STYLES.info;

  // Entrance animation
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  // Progress bar countdown
  useEffect(() => {
    const interval = 30; // ms per tick
    const step = (interval / toast.duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - step;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [toast.duration]);

  // Exit animation then remove
  function handleClose() {
    setLeaving(true);
    setTimeout(() => onRemove(toast.id), 300);
  }

  return (
    <div
      className={`
        relative w-80 rounded-2xl overflow-hidden ring-1 ring-black/5
        ${style.container}
        transition-all duration-300 ease-out
        ${visible && !leaving
          ? "opacity-100 translate-x-0"
          : "opacity-0 translate-x-full"
        }
      `}
    >
      {/* Main content */}
      <div className="flex items-start gap-3 px-4 py-3.5">

        {/* Icon */}
        <div className="mt-0.5">
          {style.icon}
        </div>

        {/* Message */}
        <p className={`flex-1 text-sm font-medium leading-snug ${style.title}`}>
          {toast.message}
        </p>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="mt-0.5 p-1 rounded-lg text-gray-300
                     hover:text-gray-500 hover:bg-gray-100
                     transition-all duration-150 flex-shrink-0"
          aria-label="Dismiss notification"
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      </div>

      {/* Progress bar */}
      <div
        className={`h-0.5 ${style.bar} transition-all ease-linear`}
        style={{
          width: `${progress}%`,
          transitionDuration: "30ms",
        }}
      />
    </div>
  );
}

// ── Toast Container — fixed top-right, renders all toasts ─────
export function ToastContainer() {
  const { toasts, removeToast } = useToastContext();

  return (
    <div
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
}