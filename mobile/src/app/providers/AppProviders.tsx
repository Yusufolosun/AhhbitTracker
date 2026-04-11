import { type PropsWithChildren } from 'react';
import { AppStateProvider } from '@/app/state';
import { QueryProvider } from './QueryProvider';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <AppStateProvider>{children}</AppStateProvider>
    </QueryProvider>
  );
}