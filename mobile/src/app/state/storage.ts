import AsyncStorage from '@react-native-async-storage/async-storage';
import { validateStacksAddress } from '@/shared/utils';
import type { PersistedAppState } from './types';

const STORAGE_KEY = 'ahhbittracker.mobile.app-state.v1';

function isPersistedAppState(value: unknown): value is PersistedAppState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const typedValue = value as Partial<PersistedAppState>;
  const isAddressValid =
    typedValue.trackedAddress === null || typeof typedValue.trackedAddress === 'string';

  return typedValue.version === 1 && isAddressValid;
}

export async function loadPersistedAppState(): Promise<PersistedAppState | null> {
  const rawValue = await AsyncStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue: unknown = JSON.parse(rawValue);

    if (!isPersistedAppState(parsedValue)) {
      await AsyncStorage.removeItem(STORAGE_KEY);
      return null;
    }

    if (parsedValue.trackedAddress) {
      const validationError = validateStacksAddress(parsedValue.trackedAddress);
      if (validationError) {
        await AsyncStorage.removeItem(STORAGE_KEY);
        return null;
      }
    }

    return parsedValue;
  } catch {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export async function saveTrackedAddress(trackedAddress: string): Promise<void> {
  const payload: PersistedAppState = {
    version: 1,
    trackedAddress,
  };

  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export async function clearPersistedAppState(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}