import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Suporte a chamada global via evento de janela
export const notifyToast = (message: string, type: ToastType = 'success', duration = 3000) => {
  window.dispatchEvent(
    new CustomEvent('apponte_toast', {
      detail: { message, type, duration },
    }),
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'success', duration = 3000) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type }]);

      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast],
  );

  const success = useCallback(
    (message: string, duration?: number) => showToast(message, 'success', duration),
    [showToast],
  );
  const error = useCallback(
    (message: string, duration?: number) => showToast(message, 'error', duration),
    [showToast],
  );
  const info = useCallback(
    (message: string, duration?: number) => showToast(message, 'info', duration),
    [showToast],
  );

  // Escutar eventos globais de toast
  React.useEffect(() => {
    const handleEvent = (e: Event) => {
      const custom = e as CustomEvent;
      if (custom.detail?.message) {
        showToast(custom.detail.message, custom.detail.type || 'success', custom.detail.duration || 3000);
      }
    };

    window.addEventListener('apponte_toast', handleEvent);
    return () => window.removeEventListener('apponte_toast', handleEvent);
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}

      {/* Floating Toasts Container */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 pointer-events-none w-full max-w-sm px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-xl border backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-4 duration-300 w-full ${
              toast.type === 'success'
                ? 'bg-slate-900/95 text-white border-emerald-500/40 shadow-emerald-950/20 dark:bg-emerald-950/90 dark:border-emerald-500/50'
                : toast.type === 'error'
                ? 'bg-slate-900/95 text-white border-rose-500/40 shadow-rose-950/20 dark:bg-rose-950/90 dark:border-rose-500/50'
                : 'bg-slate-900/95 text-white border-blue-500/40 shadow-blue-950/20 dark:bg-slate-900/90 dark:border-slate-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === 'success' && (
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                </div>
              )}
              {toast.type === 'error' && (
                <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4 stroke-[2.5]" />
                </div>
              )}
              {toast.type === 'info' && (
                <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Info className="w-4 h-4 stroke-[2.5]" />
                </div>
              )}
              <span className="text-xs font-semibold tracking-tight">{toast.message}</span>
            </div>

            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
              aria-label="Fechar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
