import { useCallback, useEffect, useRef, useState } from 'react';

export type InteractionStatusTone = 'success' | 'error' | 'info';

export interface InteractionStatus {
  tone: InteractionStatusTone;
  message: string;
}

interface UseInteractionStatusOptions {
  autoClearMs?: number;
}

const DEFAULT_AUTO_CLEAR_MS = 3_000;

export function useInteractionStatus(options: UseInteractionStatusOptions = {}) {
  const { autoClearMs = DEFAULT_AUTO_CLEAR_MS } = options;
  const [status, setStatus] = useState<InteractionStatus | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (!timeoutRef.current) {
      return;
    }

    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
  }, []);

  const clearStatus = useCallback(() => {
    clearTimer();
    setStatus(null);
  }, [clearTimer]);

  const showStatus = useCallback(
    (tone: InteractionStatusTone, message: string) => {
      clearTimer();
      setStatus({ tone, message });

      timeoutRef.current = setTimeout(() => {
        setStatus(null);
        timeoutRef.current = null;
      }, autoClearMs);
    },
    [autoClearMs, clearTimer],
  );

  const showSuccess = useCallback((message: string) => {
    showStatus('success', message);
  }, [showStatus]);

  const showError = useCallback((message: string) => {
    showStatus('error', message);
  }, [showStatus]);

  const showInfo = useCallback((message: string) => {
    showStatus('info', message);
  }, [showStatus]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return {
    status,
    clearStatus,
    showInfo,
    showSuccess,
    showError,
  };
}
