import { type PropsWithChildren } from 'react';
import { AddressProvider } from '@/features/address';
import { QueryProvider } from './QueryProvider';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <AddressProvider>{children}</AddressProvider>
    </QueryProvider>
  );
}