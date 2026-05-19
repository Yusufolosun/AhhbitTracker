import { useMemo } from 'react';
import { useAppState, useAppStateActions } from './AppStateContext';

export { useAppState, useAppStateActions };

export function useAddressState() {
  const state = useAppState();
  const { setTrackedAddress, clearTrackedAddress } = useAppStateActions();

  return useMemo(
    () => ({
      activeAddress: state.trackedAddress,
      isHydrating: state.isHydrating,
      setAddress: setTrackedAddress,
      clearAddress: clearTrackedAddress,
    }),
    [state.trackedAddress, state.isHydrating, setTrackedAddress, clearTrackedAddress],
  );
}

export function usePreviewState() {
  const state = useAppState();
  const { setPreview, clearPreview } = useAppStateActions();

  return useMemo(
    () => ({
      preview: state.preview,
      setPreview,
      clearPreview,
    }),
    [state.preview, setPreview, clearPreview],
  );
}

export function useWalletInteractionState() {
  const state = useAppState();
  const { setWalletInteraction, clearWalletInteraction } = useAppStateActions();

  return useMemo(
    () => ({
      walletInteraction: state.walletInteraction,
      setWalletInteraction,
      clearWalletInteraction,
    }),
    [state.walletInteraction, setWalletInteraction, clearWalletInteraction],
  );
}