import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import type { ContractCallPreview } from '@/core/types';

interface PreviewContextValue {
  preview: ContractCallPreview | null;
  setPreview: (nextPreview: ContractCallPreview) => void;
  clearPreview: () => void;
}

const PreviewContext = createContext<PreviewContextValue | undefined>(undefined);

export function PreviewProvider({ children }: PropsWithChildren) {
  const [preview, setPreviewState] = useState<ContractCallPreview | null>(null);

  const setPreview = useCallback((nextPreview: ContractCallPreview) => {
    setPreviewState(nextPreview);
  }, []);

  const clearPreview = useCallback(() => {
    setPreviewState(null);
  }, []);

  const value = useMemo<PreviewContextValue>(
    () => ({
      preview,
      setPreview,
      clearPreview,
    }),
    [preview, setPreview, clearPreview],
  );

  return <PreviewContext.Provider value={value}>{children}</PreviewContext.Provider>;
}

export function usePreview() {
  const context = useContext(PreviewContext);
  if (!context) {
    throw new Error('usePreview must be used within PreviewProvider');
  }

  return context;
}
