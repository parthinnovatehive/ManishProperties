"use client";

import { useState, useEffect } from "react";
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from "lucide-react";
import { toastManager } from "@/lib/utils/toast";

interface Toast {
  id: string;
  message: string;
  type: "error" | "success" | "info" | "warning";
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    return toastManager.subscribe(setToasts);
  }, []);

  const dismiss = (id: string) => toastManager.dismiss(id);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast, idx) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-2xl animate-slide-in-right border-l-4 ${
            toast.type === "error"
              ? "bg-red-50 text-red-900 border-l-red-500"
              : toast.type === "success"
              ? "bg-green-50 text-green-900 border-l-green-500"
              : toast.type === "warning"
              ? "bg-yellow-50 text-yellow-900 border-l-yellow-500"
              : "bg-blue-50 text-blue-900 border-l-blue-500"
          }`}
          style={{ animationDelay: `${idx * 100}ms` }}
        >
          {toast.type === "error" && (
            <AlertCircle className="flex-shrink-0 w-5 h-5 text-red-500" />
          )}
          {toast.type === "success" && (
            <CheckCircle className="flex-shrink-0 w-5 h-5 text-green-500" />
          )}
          {toast.type === "warning" && (
            <AlertTriangle className="flex-shrink-0 w-5 h-5 text-yellow-500" />
          )}
          {toast.type === "info" && (
            <Info className="flex-shrink-0 w-5 h-5 text-blue-500" />
          )}

          <span className="flex-1">{toast.message}</span>

          <button
            onClick={() => dismiss(toast.id)}
            className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
