import { type PropsWithChildren } from 'react';
import { AddressProvider } from '@/features/address';
import { PreviewProvider } from '@/features/transactions';
import { QueryProvider } from './QueryProvider';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <AddressProvider>
        <PreviewProvider>{children}</PreviewProvider>
      </AddressProvider>
    </QueryProvider>
  );
}