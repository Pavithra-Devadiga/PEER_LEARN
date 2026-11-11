import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const idCounter = useRef(0);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'info', durationMs = 3600) => {
      if (!message) return;
      const id = ++idCounter.current;
      setToasts((prev) => [...prev.slice(-3), { id, message: String(message), type }]);
      if (durationMs > 0) {
        window.setTimeout(() => {
          dismissToast(id);
        }, durationMs);
      }
    },
    [dismissToast]
  );

  const stylesByType = {
    success: {
      border: 'border-emerald-500/35',
      iconWrap: 'bg-emerald-500/15 text-emerald-500',
      Icon: CheckCircle2,
    },
    error: {
      border: 'border-rose-500/40',
      iconWrap: 'bg-rose-500/15 text-rose-500',
      Icon: AlertCircle,
    },
    info: {
      border: 'border-accent/35',
      iconWrap: 'bg-accent-muted text-accent',
      Icon: Info,
    },
  };

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}

      {toasts.length > 0 && (
        <div
          aria-live="polite"
          className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm w-[calc(100%-2.5rem)] sm:w-full pointer-events-none"
        >
          {toasts.map((toast) => {
            const cfg = stylesByType[toast.type] || stylesByType.info;
            const IconComp = cfg.Icon;
            return (
              <div
                key={toast.id}
                role="status"
                className={`pointer-events-auto bg-card/95 backdrop-blur-md border ${cfg.border} shadow-popover rounded-2xl px-3.5 py-3 flex items-start gap-3`}
              >
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${cfg.iconWrap}`}>
                  <IconComp className="w-4 h-4" />
                </div>
                <p className="text-xs font-semibold text-text-main leading-relaxed flex-1 pt-0.5 break-words">
                  {toast.message}
                </p>
                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  aria-label="Dismiss notification"
                  className="text-text-muted hover:text-text-main p-0.5 rounded-lg transition-colors shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
};
