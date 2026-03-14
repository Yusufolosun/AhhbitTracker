import { useEffect } from 'react';
import { TOAST_DURATION } from '../utils/constants';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className={`${bgColors[type]} text-white px-6 py-4 rounded-lg shadow-lg animate-fade-in pointer-events-auto`}>
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
