import { useMemo } from 'react';
import { useAppStateContext } from './AppStateContext';

export function useAppState() {
  return useAppStateContext().state;
}

export function useAddressState() {
  const { state, setTrackedAddress, clearTrackedAddress } = useAppStateContext();

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
  const { state, setPreview, clearPreview } = useAppStateContext();

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
  const {
    state,
    setWalletInteraction,
    clearWalletInteraction,
  } = useAppStateContext();

  return useMemo(
    () => ({
      walletInteraction: state.walletInteraction,
      setWalletInteraction,
      clearWalletInteraction,
    }),
    [state.walletInteraction, setWalletInteraction, clearWalletInteraction],
  );
}