import { beforeEach, describe, expect, it, vi } from 'vitest';

const getPermissionsAsync = vi.fn();
const requestPermissionsAsync = vi.fn();
const setNotificationHandler = vi.fn();
const setNotificationChannelAsync = vi.fn();

vi.mock('expo-notifications', () => ({
  AndroidImportance: {
    HIGH: 'high',
  },
  SchedulableTriggerInputTypes: {
    DATE: 'date',
  },
  getPermissionsAsync,
  requestPermissionsAsync,
  setNotificationHandler,
  setNotificationChannelAsync,
  scheduleNotificationAsync: vi.fn(),
  cancelScheduledNotificationAsync: vi.fn(),
  addNotificationResponseReceivedListener: vi.fn(() => ({ remove: vi.fn() })),
  getLastNotificationResponseAsync: vi.fn(async () => null),
}));

const platform = { OS: 'ios' };

vi.mock('react-native', () => ({
  Platform: platform,
}));

vi.mock('expo-linking', () => ({
  createURL: (path: string) => `ahhbittracker://${path}`,
  openURL: vi.fn(async () => undefined),
}));

beforeEach(() => {
  vi.clearAllMocks();
  platform.OS = 'ios';
});

async function loadServiceModule() {
  vi.resetModules();
  return import('../mobile/src/features/notifications/service');
}

describe('mobile notification service', () => {
  it('normalizes granted and denied permission states', async () => {
    getPermissionsAsync.mockResolvedValueOnce({ status: 'granted', granted: true });
    requestPermissionsAsync.mockResolvedValueOnce({ status: 'denied', granted: false });

    const service = await loadServiceModule();
    const granted = await service.getNotificationPermissionState();
    const denied = await service.requestNotificationPermission();

    expect(granted).toBe('granted');
    expect(denied).toBe('denied');
  });

  it('maps unknown permission statuses to unknown', async () => {
    getPermissionsAsync.mockResolvedValueOnce({ status: 'limited', granted: false });

    const service = await loadServiceModule();
    await expect(service.getNotificationPermissionState()).resolves.toBe('unknown');
  });

  it('configures notification runtime once and sets Android channel on Android', async () => {
    platform.OS = 'android';

    const service = await loadServiceModule();
    service.configureNotificationRuntime();
    service.configureNotificationRuntime();

    expect(setNotificationHandler).toHaveBeenCalledTimes(1);
    expect(setNotificationChannelAsync).toHaveBeenCalledTimes(1);
    expect(setNotificationChannelAsync).toHaveBeenCalledWith(
      service.NOTIFICATION_CHANNEL_ID,
      expect.objectContaining({
        name: 'AhhbitTracker reminders',
      }),
    );
  });
});
