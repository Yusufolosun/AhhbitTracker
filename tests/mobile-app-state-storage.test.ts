import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const storage = new Map<string, string>();
const STORAGE_KEY = 'ahhbittracker.mobile.app-state.v1';

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(async (key: string) => (storage.has(key) ? storage.get(key)! : null)),
    setItem: vi.fn(async (key: string, value: string) => {
      storage.set(key, value);
    }),
    removeItem: vi.fn(async (key: string) => {
      storage.delete(key);
    }),
  },
}));

let loadPersistedAppState: () => Promise<{ version: 1; trackedAddress: string | null } | null>;
let saveTrackedAddress: (trackedAddress: string) => Promise<void>;
let clearPersistedAppState: () => Promise<void>;

beforeAll(async () => {
  ({
    loadPersistedAppState,
    saveTrackedAddress,
    clearPersistedAppState,
  } = await import('../mobile/src/app/state/storage'));
});

beforeEach(() => {
  storage.clear();
});

describe('mobile app state storage', () => {
  it('saves and loads tracked address payload', async () => {
    await saveTrackedAddress('SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z');

    const loaded = await loadPersistedAppState();

    expect(loaded).toEqual({
      version: 1,
      trackedAddress: 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z',
    });
  });

  it('returns null and clears storage when JSON is malformed', async () => {
    storage.set(STORAGE_KEY, '{not-valid-json');

    const loaded = await loadPersistedAppState();

    expect(loaded).toBeNull();
    expect(storage.has(STORAGE_KEY)).toBe(false);
  });

  it('returns null and clears storage when address payload is invalid', async () => {
    storage.set(
      STORAGE_KEY,
      JSON.stringify({
        version: 1,
        trackedAddress: 'invalid-address',
      }),
    );

    const loaded = await loadPersistedAppState();

    expect(loaded).toBeNull();
    expect(storage.has(STORAGE_KEY)).toBe(false);
  });

  it('clears persisted app state', async () => {
    await saveTrackedAddress('SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z');
    await clearPersistedAppState();

    expect(await loadPersistedAppState()).toBeNull();
  });
});
