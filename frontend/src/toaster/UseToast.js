import { useToastContext } from "./ToastContext";

// ── useToast — import and call this anywhere in your app ──────
export function useToast() {
  const { showToast } = useToastContext();

  return {
    // ✅ success — green
    success: (message, duration = 4000) =>
      showToast({ message, type: "success", duration }),

    // ❌ error — red
    error: (message, duration = 4000) =>
      showToast({ message, type: "error", duration }),

    // ⚠️ warning — amber
    warning: (message, duration = 4000) =>
      showToast({ message, type: "warning", duration }),

    // ℹ️ info — indigo
    info: (message, duration = 4000) =>
      showToast({ message, type: "info", duration }),
  };
}