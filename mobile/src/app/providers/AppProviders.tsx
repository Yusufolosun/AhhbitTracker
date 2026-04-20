import type { PropsWithChildren } from 'react';
import { AppStateProvider } from '@/app/state';
import { NotificationCenterProvider } from '@/features/notifications';
import { QueryProvider } from './QueryProvider';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <AppStateProvider>
        <NotificationCenterProvider>{children}</NotificationCenterProvider>
      </AppStateProvider>
    </QueryProvider>
  );
}