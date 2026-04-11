import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type PropsWithChildren,
} from 'react';
import { validateStacksAddress } from '@/shared/utils';
import { appStateActions } from './actions';
import { appStateReducer, createInitialAppState } from './reducer';
import type { AppState } from './types';
import type { ContractCallPreview } from '@/core/types';

interface AppStateContextValue {
  state: AppState;
  setTrackedAddress: (value: string) => Promise<void>;
  clearTrackedAddress: () => Promise<void>;
  setPreview: (nextPreview: ContractCallPreview) => void;
  clearPreview: () => void;
}

const AppStateContext = createContext<AppStateContextValue | undefined>(undefined);

export function AppStateProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(appStateReducer, undefined, createInitialAppState);

  useEffect(() => {
    dispatch(appStateActions.hydrateComplete(null));
  }, []);

  const setTrackedAddress = useCallback(async (value: string) => {
    const normalizedAddress = value.trim();
    const validationError = validateStacksAddress(normalizedAddress);

    if (validationError) {
      throw new Error(validationError);
    }

    dispatch(appStateActions.setAddress(normalizedAddress));
  }, []);

  const clearTrackedAddress = useCallback(async () => {
    dispatch(appStateActions.clearAddress());
  }, []);

  const setPreview = useCallback((nextPreview: ContractCallPreview) => {
    dispatch(appStateActions.setPreview(nextPreview));
  }, []);

  const clearPreview = useCallback(() => {
    dispatch(appStateActions.clearPreview());
  }, []);

  const value = useMemo<AppStateContextValue>(
    () => ({
      state,
      setTrackedAddress,
      clearTrackedAddress,
      setPreview,
      clearPreview,
    }),
    [state, setTrackedAddress, clearTrackedAddress, setPreview, clearPreview],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppStateContext() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('useAppStateContext must be used within AppStateProvider');
  }

  return context;
}