import { useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { Toast } from './Toast';

export function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  // Escape key handler to dismiss the most recent toast
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && toasts.length > 0) {
        // Dismiss the most recent toast (last in array)
        dismissToast(toasts[toasts.length - 1].id);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [toasts, dismissToast]);

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      role="status"
      className="fixed top-20 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => dismissToast(toast.id)}
        />
      ))}
    </div>
  );
}
