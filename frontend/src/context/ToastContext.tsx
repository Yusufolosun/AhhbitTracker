/**
 * @module ToastContext
 * Context provider for displaying toast notifications.
 */
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

/** Shape of a toast notification item. */
export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

/** Shape of the toast context value. */
interface ToastContextType {
  toasts: ToastItem[];
  showToast: (message: string, type: ToastItem['type']) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Hook to access toast notification functions.
 * Must be used within a ToastProvider.
 *
 * @throws Error if used outside ToastProvider
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

/** Counter for generating unique toast IDs. */
let toastCounter = 0;

/**
 * Provider component for toast notification state.
 * Manages a list of active toasts with auto-incrementing IDs.
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastItem['type']) => {
      const id = `toast-${++toastCounter}`;
      setToasts((prev) => [...prev, { id, message, type }]);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}
    </ToastContext.Provider>
  );
};
