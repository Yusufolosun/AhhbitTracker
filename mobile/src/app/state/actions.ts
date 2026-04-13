import type { ContractCallPreview } from '@/core/types';
import type { WalletInteractionState } from '@/features/wallet/types';

export type AppStateAction =
  | { type: 'hydrate:start' }
  | { type: 'hydrate:complete'; payload: { trackedAddress: string | null } }
  | { type: 'address:set'; payload: { trackedAddress: string } }
  | { type: 'address:clear' }
  | { type: 'preview:set'; payload: { preview: ContractCallPreview } }
  | { type: 'preview:clear' }
  | { type: 'wallet-interaction:set'; payload: { walletInteraction: WalletInteractionState } }
  | { type: 'wallet-interaction:clear' };

export const appStateActions = {
  hydrateStart: (): AppStateAction => ({ type: 'hydrate:start' }),
  hydrateComplete: (trackedAddress: string | null): AppStateAction => ({
    type: 'hydrate:complete',
    payload: { trackedAddress },
  }),
  setAddress: (trackedAddress: string): AppStateAction => ({
    type: 'address:set',
    payload: { trackedAddress },
  }),
  clearAddress: (): AppStateAction => ({ type: 'address:clear' }),
  setPreview: (preview: ContractCallPreview): AppStateAction => ({
    type: 'preview:set',
    payload: { preview },
  }),
  clearPreview: (): AppStateAction => ({ type: 'preview:clear' }),
  setWalletInteraction: (walletInteraction: WalletInteractionState): AppStateAction => ({
    type: 'wallet-interaction:set',
    payload: { walletInteraction },
  }),
  clearWalletInteraction: (): AppStateAction => ({ type: 'wallet-interaction:clear' }),
};