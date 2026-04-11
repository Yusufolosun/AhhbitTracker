import { type PropsWithChildren } from 'react';
import { AppStateProvider, useAddressState } from '@/app/state';

export function AddressProvider({ children }: PropsWithChildren) {
  return <AppStateProvider>{children}</AppStateProvider>;
}

export function useAddress() {
  return useAddressState();
}
