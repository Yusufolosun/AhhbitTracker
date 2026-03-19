import { useEffect } from 'react';
import { TOAST_DURATION } from '../utils/constants';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    // Error toasts stay longer (8 seconds) so users have time to read them
    // Success/info toasts auto-dismiss after 5 seconds
    const duration = type === 'error' ? 8000 : TOAST_DURATION;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, type]);

  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={`${bgColors[type]} text-white px-6 py-4 rounded-lg shadow-lg animate-fade-in pointer-events-auto`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200"
          aria-label="Close notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
