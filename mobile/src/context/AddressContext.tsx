import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { validateStacksAddress } from '../utils/validation';

interface AddressContextValue {
  activeAddress: string | null;
  isHydrating: boolean;
  setAddress: (value: string) => Promise<void>;
  clearAddress: () => Promise<void>;
}

const STORAGE_KEY = 'ahhbittracker.mobile.address';

const AddressContext = createContext<AddressContextValue | undefined>(undefined);

export function AddressProvider({ children }: PropsWithChildren) {
  const [activeAddress, setActiveAddress] = useState<string | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  useEffect(() => {
    let mounted = true;

    const hydrate = async () => {
      try {
        const value = await AsyncStorage.getItem(STORAGE_KEY);
        if (!mounted || !value) {
          return;
        }

        if (!validateStacksAddress(value)) {
          setActiveAddress(value);
        }
      } finally {
        if (mounted) {
          setIsHydrating(false);
        }
      }
    };

    void hydrate();

    return () => {
      mounted = false;
    };
  }, []);

  const setAddress = useCallback(async (value: string) => {
    const normalized = value.trim();
    const error = validateStacksAddress(normalized);

    if (error) {
      throw new Error(error);
    }

    await AsyncStorage.setItem(STORAGE_KEY, normalized);
    setActiveAddress(normalized);
  }, []);

  const clearAddress = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setActiveAddress(null);
  }, []);

  const contextValue = useMemo<AddressContextValue>(
    () => ({
      activeAddress,
      isHydrating,
      setAddress,
      clearAddress,
    }),
    [activeAddress, isHydrating, setAddress, clearAddress],
  );

  return <AddressContext.Provider value={contextValue}>{children}</AddressContext.Provider>;
}

export function useAddress() {
  const context = useContext(AddressContext);

  if (!context) {
    throw new Error('useAddress must be used within AddressProvider');
  }

  return context;
}
