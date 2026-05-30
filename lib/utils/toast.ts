/**
 * Toast Utility
 * Simple toast notification system
 */

type ToastType = "error" | "success" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

class ToastManager {
  private toasts: Map<string, Toast> = new Map();
  private listeners: Set<(toasts: Toast[]) => void> = new Set();
  private toastId = 0;

  subscribe(listener: (toasts: Toast[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((listener) =>
      listener(Array.from(this.toasts.values()))
    );
  }

  show(message: string, type: ToastType = "info", duration: number = 3000) {
    const id = `toast-${++this.toastId}`;
    const toast: Toast = { id, message, type, duration };

    this.toasts.set(id, toast);
    this.notify();

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }

    return id;
  }

  dismiss(id: string) {
    this.toasts.delete(id);
    this.notify();
  }

  error(message: string, duration?: number) {
    return this.show(message, "error", duration);
  }

  success(message: string, duration?: number) {
    return this.show(message, "success", duration);
  }

  info(message: string, duration?: number) {
    return this.show(message, "info", duration);
  }

  warning(message: string, duration?: number) {
    return this.show(message, "warning", duration);
  }

  getToasts(): Toast[] {
    return Array.from(this.toasts.values());
  }
}

/**
 * Singleton instance
 */
export const toastManager = new ToastManager();

/**
 * Hook to use toast notifications
 */
export function useToast() {
  return {
    error: (message: string, duration?: number) =>
      toastManager.error(message, duration),
    success: (message: string, duration?: number) =>
      toastManager.success(message, duration),
    info: (message: string, duration?: number) =>
      toastManager.info(message, duration),
    warning: (message: string, duration?: number) =>
      toastManager.warning(message, duration),
  };
}
