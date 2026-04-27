import { beforeEach, describe, expect, it, vi } from 'vitest';

const getPermissionsAsync = vi.fn();
const requestPermissionsAsync = vi.fn();
const setNotificationHandler = vi.fn();
const setNotificationChannelAsync = vi.fn();
const scheduleNotificationAsync = vi.fn();
const cancelScheduledNotificationAsync = vi.fn();
const openURL = vi.fn();

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
  scheduleNotificationAsync,
  cancelScheduledNotificationAsync,
  addNotificationResponseReceivedListener: vi.fn(() => ({ remove: vi.fn() })),
  getLastNotificationResponseAsync: vi.fn(async () => null),
}));

const platform = { OS: 'ios' };

vi.mock('react-native', () => ({
  Platform: platform,
}));

vi.mock('expo-linking', () => ({
  createURL: (path: string) => `ahhbittracker://${path}`,
  openURL,
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

  it('schedules notifications with date trigger when deliverAt exists', async () => {
    scheduleNotificationAsync.mockResolvedValueOnce('notification-1');
    const service = await loadServiceModule();

    const id = await service.scheduleNotification({
      key: 'habit:1:reminder',
      kind: 'habit-check-in-reminder',
      tone: 'warning',
      title: 'Check in soon',
      body: 'Your habit needs a check-in.',
      routePath: '/habits/1',
      habitId: 1,
      deliverAt: new Date('2026-04-27T10:00:00.000Z'),
    });

    expect(id).toBe('notification-1');
    expect(scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        trigger: expect.objectContaining({ type: 'date' }),
      }),
    );
  });

  it('schedules immediate notifications using null trigger', async () => {
    scheduleNotificationAsync.mockResolvedValueOnce('notification-2');
    const service = await loadServiceModule();

    await service.scheduleNotification({
      key: 'tx:confirmed',
      kind: 'transaction-confirmed',
      tone: 'success',
      title: 'Confirmed',
      body: 'Confirmed on chain.',
      routePath: '/preview',
      txId: '0xtx-1',
    });

    expect(scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        trigger: null,
      }),
    );
  });

  it('opens route links and can cancel scheduled notifications', async () => {
    const service = await loadServiceModule();

    await service.openNotificationRoute('habits/12');
    await service.cancelNotification('notification-12');

    expect(openURL).toHaveBeenCalledWith('ahhbittracker:///habits/12');
    expect(cancelScheduledNotificationAsync).toHaveBeenCalledWith('notification-12');
  });

  it('builds content payload and serializable notification records', async () => {
    const service = await loadServiceModule();
    const plan = {
      key: 'tx:0xtx-2:failed',
      kind: 'transaction-failed' as const,
      tone: 'danger' as const,
      title: 'Failed',
      body: 'Transaction failed on chain.',
      routePath: '/preview',
      txId: '0xtx-2',
    };

    const content = service.buildNotificationContent(plan);
    const record = service.createNotificationRecord(plan, 'record-1');

    expect(content).toMatchObject({
      title: 'Failed',
      body: 'Transaction failed on chain.',
      data: expect.objectContaining({ txId: '0xtx-2', routePath: '/preview' }),
    });
    expect(record).toMatchObject({
      id: 'record-1',
      txId: '0xtx-2',
      routePath: '/preview',
    });
    expect(typeof record.createdAt).toBe('string');
  });
});
