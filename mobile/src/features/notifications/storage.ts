import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  PersistedNotificationCenterState,
  NotificationRecord,
  ScheduledReminderRecord,
} from './types';

const STORAGE_KEY = 'ahhbittracker.mobile.notifications.v1';
const MAX_RECENT_NOTIFICATIONS = 25;

function isNotificationRecord(value: unknown): value is NotificationRecord {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const typedValue = value as Partial<NotificationRecord>;

  return (
    typeof typedValue.id === 'string' &&
    typeof typedValue.kind === 'string' &&
    typeof typedValue.tone === 'string' &&
    typeof typedValue.title === 'string' &&
    typeof typedValue.body === 'string' &&
    typeof typedValue.routePath === 'string' &&
    typeof typedValue.createdAt === 'string'
  );
}

function isScheduledReminderRecord(value: unknown): value is ScheduledReminderRecord {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const typedValue = value as Partial<ScheduledReminderRecord>;

  return typeof typedValue.identifier === 'string' && typeof typedValue.deliverAt === 'string';
}

function isPersistedNotificationState(value: unknown): value is PersistedNotificationCenterState {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const typedValue = value as Partial<PersistedNotificationCenterState>;

  return (
    typedValue.version === 1 &&
    typeof typedValue.remindersEnabled === 'boolean' &&
    typeof typedValue.eventAlertsEnabled === 'boolean' &&
    Array.isArray(typedValue.deliveredEventKeys) &&
    Array.isArray(typedValue.recentNotifications) &&
    typeof typedValue.scheduledReminders === 'object'
  );
}

function sanitizeNotificationState(
  value: PersistedNotificationCenterState,
): PersistedNotificationCenterState {
  const recentNotifications = value.recentNotifications
    .filter(isNotificationRecord)
    .slice(0, MAX_RECENT_NOTIFICATIONS);

  const scheduledReminders: Record<string, ScheduledReminderRecord> = {};

  for (const [key, record] of Object.entries(value.scheduledReminders)) {
    if (isScheduledReminderRecord(record)) {
      scheduledReminders[key] = record;
    }
  }

  return {
    version: 1,
    remindersEnabled: value.remindersEnabled,
    eventAlertsEnabled: value.eventAlertsEnabled,
    deliveredEventKeys: value.deliveredEventKeys.filter((entry): entry is string => typeof entry === 'string'),
    recentNotifications,
    scheduledReminders,
  };
}

export async function loadPersistedNotificationState(): Promise<PersistedNotificationCenterState | null> {
  const rawValue = await AsyncStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue: unknown = JSON.parse(rawValue);

    if (!isPersistedNotificationState(parsedValue)) {
      await AsyncStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return sanitizeNotificationState(parsedValue);
  } catch {
    await AsyncStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export async function savePersistedNotificationState(
  state: PersistedNotificationCenterState,
): Promise<void> {
  const nextState = sanitizeNotificationState(state);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
}

export async function clearPersistedNotificationState(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}

export function trimNotificationHistory(history: NotificationRecord[]): NotificationRecord[] {
  return history.slice(0, MAX_RECENT_NOTIFICATIONS);
}