import { useEffect } from 'react';
import { TOAST_DURATION } from '../utils/constants';
import { ActionButton, CalloutCard } from './ui';

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

  const tones = {
    success: 'success',
    error: 'danger',
    info: 'info',
  } as const;

  return (
    <div role={type === 'error' ? 'alert' : 'status'} className="pointer-events-auto">
      <CalloutCard
        title={message}
        tone={tones[type]}
        action={
          <ActionButton
            onClick={onClose}
            variant="ghost"
            className="px-2 py-1 text-white hover:bg-white/10"
            aria-label="Close notification"
          >
            ✕
          </ActionButton>
        }
      />
    </div>
  );
}
