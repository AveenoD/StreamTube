import { createContext, useContext, useState, useCallback } from "react";

// ── Create context ────────────────────────────────────────────
const ToastContext = createContext(null);

// ── Provider — wrap your App with this ───────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // Add a new toast
  const showToast = useCallback(({ message, type = "info", duration = 4000 }) => {
    const id = Date.now() + Math.random(); // unique id

    setToasts((prev) => [...prev, { id, message, type, duration }]);

    // Auto remove after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  // Remove a toast by id
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast, toasts }}>
      {children}
    </ToastContext.Provider>
  );
}

// ── Internal hook (used by ToastContainer and useToast) ──────
export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return context;
}