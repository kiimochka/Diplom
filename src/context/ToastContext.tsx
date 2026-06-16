import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { createPortal } from "react-dom";

type ToastType = "success" | "error" | "info";

type ToastInput = {
  type?: ToastType;
  title: string;
  message?: string;
  durationMs?: number;
};

type Toast = Required<Omit<ToastInput, "durationMs">> & {
  id: string;
};

type ToastContextValue = {
  showToast: (toast: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ type = "info", title, message = "", durationMs = 4200 }: ToastInput) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const toast = { id, type, title, message };

      setToasts((current) => [...current, toast]);
      window.setTimeout(() => dismissToast(id), durationMs);
    },
    [dismissToast],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  const toastStack = (
    <div className="toast-stack" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast-card toast-card--${toast.type}`}
          role="status"
        >
          <div className="toast-card__icon" aria-hidden="true" />
          <div className="toast-card__content">
            <div className="toast-card__title">{toast.title}</div>
            {toast.message && (
              <div className="toast-card__message">{toast.message}</div>
            )}
          </div>
          <button
            type="button"
            className="toast-card__close"
            aria-label="Закрыть уведомление"
            onClick={() => dismissToast(toast.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      {createPortal(toastStack, document.body)}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
};

  const showToast = useCallback(
    ({ type = "info", title, message = "", durationMs = 4200 }: ToastInput) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const toast = { id, type, title, message };

      setToasts((current) => [...current, toast]);
      window.setTimeout(() => dismissToast(id), durationMs);
    },
    [dismissToast],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast-card toast-card--${toast.type}`}
            role="status"
          >
            <div className="toast-card__icon" aria-hidden="true" />
            <div className="toast-card__content">
              <div className="toast-card__title">{toast.title}</div>
              {toast.message && (
                <div className="toast-card__message">{toast.message}</div>
              )}
            </div>
            <button
              type="button"
              className="toast-card__close"
              aria-label="Закрыть уведомление"
              onClick={() => dismissToast(toast.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }

  return context;
};
