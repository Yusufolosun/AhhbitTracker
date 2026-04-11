import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type PropsWithChildren,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/core/config';
import { validateStacksAddress } from '@/shared/utils';
import { appStateActions } from './actions';
import { appStateReducer, createInitialAppState } from './reducer';
import { clearPersistedAppState, loadPersistedAppState, saveTrackedAddress } from './storage';
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
  const queryClient = useQueryClient();
  const previousAddressRef = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      dispatch(appStateActions.hydrateStart());

      try {
        const persistedState = await loadPersistedAppState();

        if (!isMounted) {
          return;
        }

        dispatch(appStateActions.hydrateComplete(persistedState?.trackedAddress ?? null));
      } catch {
        if (!isMounted) {
          return;
        }

        dispatch(appStateActions.hydrateComplete(null));
      }
    };

    void hydrate();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (state.isHydrating) {
      return;
    }

    const previousAddress = previousAddressRef.current;
    const currentAddress = state.trackedAddress;

    if (previousAddress === currentAddress) {
      return;
    }

    if (previousAddress) {
      queryClient.removeQueries({ queryKey: QUERY_KEYS.userHabits(previousAddress) });
      queryClient.removeQueries({ queryKey: QUERY_KEYS.userStats(previousAddress) });
    }

    queryClient.removeQueries({ queryKey: QUERY_KEYS.userHabits('anonymous') });
    queryClient.removeQueries({ queryKey: QUERY_KEYS.userStats('anonymous') });

    if (currentAddress) {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userHabits(currentAddress) });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userStats(currentAddress) });
    }

    previousAddressRef.current = currentAddress;
  }, [state.isHydrating, state.trackedAddress, queryClient]);

  const setTrackedAddress = useCallback(async (value: string) => {
    const normalizedAddress = value.trim();
    const validationError = validateStacksAddress(normalizedAddress);

    if (validationError) {
      throw new Error(validationError);
    }

    await saveTrackedAddress(normalizedAddress);
    dispatch(appStateActions.setAddress(normalizedAddress));
  }, []);

  const clearTrackedAddress = useCallback(async () => {
    await clearPersistedAppState();
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