import { type PropsWithChildren } from 'react';
import { AppStateProvider, usePreviewState } from '@/app/state';

export function PreviewProvider({ children }: PropsWithChildren) {
  return <AppStateProvider>{children}</AppStateProvider>;
}

export function usePreview() {
  return usePreviewState();
}
