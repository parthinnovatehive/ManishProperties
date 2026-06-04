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
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 rounded-lg p-4 text-sm font-medium shadow-lg animate-in slide-in-from-right-full duration-300 ${
            toast.type === "error"
              ? "bg-red-50 text-red-900 border border-red-200"
              : toast.type === "success"
              ? "bg-green-50 text-green-900 border border-green-200"
              : toast.type === "warning"
              ? "bg-yellow-50 text-yellow-900 border border-yellow-200"
              : "bg-blue-50 text-blue-900 border border-blue-200"
          }`}
        >
          {toast.type === "error" && (
            <AlertCircle className="flex-shrink-0 w-5 h-5" />
          )}
          {toast.type === "success" && (
            <CheckCircle className="flex-shrink-0 w-5 h-5" />
          )}
          {toast.type === "warning" && (
            <AlertTriangle className="flex-shrink-0 w-5 h-5" />
          )}
          {toast.type === "info" && (
            <Info className="flex-shrink-0 w-5 h-5" />
          )}

          <span className="flex-1">{toast.message}</span>

          <button
            onClick={() => dismiss(toast.id)}
            className="flex-shrink-0 opacity-70 hover:opacity-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
