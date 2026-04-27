import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const storage = new Map<string, string>();

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

let loadPersistedNotificationState: () => Promise<any>;
let savePersistedNotificationState: (state: any) => Promise<void>;
let clearPersistedNotificationState: () => Promise<void>;
let trimNotificationHistory: (history: any[]) => any[];

beforeAll(async () => {
  ({
    loadPersistedNotificationState,
    savePersistedNotificationState,
    clearPersistedNotificationState,
    trimNotificationHistory,
  } = await import('../mobile/src/features/notifications/storage'));
});

beforeEach(() => {
  storage.clear();
});

function buildPersistedState(overrides: Record<string, unknown> = {}) {
  return {
    version: 1,
    remindersEnabled: true,
    eventAlertsEnabled: true,
    deliveredEventKeys: ['event:1'],
    recentNotifications: [
      {
        id: 'notif-1',
        kind: 'transaction-confirmed',
        tone: 'success',
        title: 'Confirmed',
        body: 'Transaction confirmed.',
        routePath: '/preview',
        createdAt: new Date().toISOString(),
        txId: '0xtx-1',
      },
    ],
    scheduledReminders: {
      'habit:1': {
        identifier: 'reminder-1',
        deliverAt: new Date('2026-04-27T08:00:00.000Z').toISOString(),
      },
    },
    ...overrides,
  };
}

describe('mobile notification storage', () => {
  it('saves and loads persisted notification center state', async () => {
    const state = buildPersistedState();

    await savePersistedNotificationState(state);
    const loaded = await loadPersistedNotificationState();

    expect(loaded).toMatchObject({
      version: 1,
      remindersEnabled: true,
      eventAlertsEnabled: true,
      deliveredEventKeys: ['event:1'],
    });
    expect(loaded?.recentNotifications).toHaveLength(1);
    expect(loaded?.scheduledReminders['habit:1']).toMatchObject({ identifier: 'reminder-1' });
  });

  it('keeps only valid reminder and notification records when sanitizing', async () => {
    await savePersistedNotificationState(
      buildPersistedState({
        deliveredEventKeys: ['event:ok', 123, null],
        recentNotifications: [
          buildPersistedState().recentNotifications[0],
          { id: 2, title: 'bad shape' },
        ],
        scheduledReminders: {
          'habit:ok': {
            identifier: 'reminder-ok',
            deliverAt: new Date('2026-04-27T09:00:00.000Z').toISOString(),
          },
          broken: {
            identifier: 15,
          },
        },
      }),
    );

    const loaded = await loadPersistedNotificationState();

    expect(loaded?.deliveredEventKeys).toEqual(['event:ok']);
    expect(loaded?.recentNotifications).toHaveLength(1);
    expect(Object.keys(loaded?.scheduledReminders ?? {})).toEqual(['habit:ok']);
  });

  it('clears persisted notification state', async () => {
    await savePersistedNotificationState(buildPersistedState());
    await clearPersistedNotificationState();

    const loaded = await loadPersistedNotificationState();
    expect(loaded).toBeNull();
  });

  it('trims notification history to at most 25 items', () => {
    const history = Array.from({ length: 30 }, (_, index) => ({ id: `n-${index}` }));

    const trimmed = trimNotificationHistory(history);

    expect(trimmed).toHaveLength(25);
    expect(trimmed[0]).toEqual({ id: 'n-0' });
    expect(trimmed[24]).toEqual({ id: 'n-24' });
  });

  it('removes persisted data when stored JSON is malformed', async () => {
    storage.set('ahhbittracker.mobile.notifications.v1', '{bad-json');

    const loaded = await loadPersistedNotificationState();

    expect(loaded).toBeNull();
    expect(storage.has('ahhbittracker.mobile.notifications.v1')).toBe(false);
  });

  it('removes persisted data when schema version is invalid', async () => {
    storage.set(
      'ahhbittracker.mobile.notifications.v1',
      JSON.stringify({
        version: 2,
        remindersEnabled: true,
        eventAlertsEnabled: true,
        deliveredEventKeys: [],
        recentNotifications: [],
        scheduledReminders: {},
      }),
    );

    const loaded = await loadPersistedNotificationState();

    expect(loaded).toBeNull();
    expect(storage.has('ahhbittracker.mobile.notifications.v1')).toBe(false);
  });

  it('caps recent notifications at 25 records during save', async () => {
    await savePersistedNotificationState(
      buildPersistedState({
        recentNotifications: Array.from({ length: 30 }, (_, index) => ({
          id: `notif-${index}`,
          kind: 'transaction-confirmed',
          tone: 'success',
          title: `Notification ${index}`,
          body: 'Body',
          routePath: '/preview',
          createdAt: new Date().toISOString(),
        })),
      }),
    );

    const loaded = await loadPersistedNotificationState();

    expect(loaded?.recentNotifications).toHaveLength(25);
    expect(loaded?.recentNotifications[0].id).toBe('notif-0');
    expect(loaded?.recentNotifications[24].id).toBe('notif-24');
  });
});
