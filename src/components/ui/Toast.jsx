"use client";

import { createContext, useContext, useState, useCallback } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

function Toast({ toast, onRemove }) {
  const { id, message, type } = toast;

  const styles = {
    success: {
      bg: "bg-green-500",
      icon: "✓",
      iconBg: "bg-green-600",
    },
    error: {
      bg: "bg-red-500",
      icon: "✗",
      iconBg: "bg-red-600",
    },
    info: {
      bg: "bg-blue-500",
      icon: "ℹ",
      iconBg: "bg-blue-600",
    },
    warning: {
      bg: "bg-yellow-500",
      icon: "⚠",
      iconBg: "bg-yellow-600",
    },
  };

  const style = styles[type] || styles.info;

  return (
    <div
      className={`${style.bg} text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-4 min-w-[320px] max-w-md pointer-events-auto animate-slide-in-right`}
      role="alert"
    >
      <div
        className={`${style.iconBg} w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg shrink-0`}
      >
        {style.icon}
      </div>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={() => onRemove(id)}
        className="text-white/80 hover:text-white transition-colors shrink-0"
        aria-label="Close"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
