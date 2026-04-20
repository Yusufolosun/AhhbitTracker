import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import * as Notifications from 'expo-notifications';
import type { NotificationPermissionState, NotificationPlan, NotificationRecord } from './types';

export const NOTIFICATION_CHANNEL_ID = 'habit-alerts';

let runtimeConfigured = false;

function normalizePermissionStatus(status: unknown, granted: boolean): NotificationPermissionState {
  if (granted) {
    return 'granted';
  }

  const normalizedStatus = String(status).toLowerCase();

  if (normalizedStatus === 'denied') {
    return 'denied';
  }

  if (normalizedStatus === 'undetermined') {
    return 'undetermined';
  }

  return 'unknown';
}

export async function getNotificationPermissionState(): Promise<NotificationPermissionState> {
  const permissions = await Notifications.getPermissionsAsync();
  return normalizePermissionStatus(permissions.status, permissions.granted);
}

export async function requestNotificationPermission(): Promise<NotificationPermissionState> {
  const permissions = await Notifications.requestPermissionsAsync();
  return normalizePermissionStatus(permissions.status, permissions.granted);
}

export function configureNotificationRuntime(): void {
  if (runtimeConfigured) {
    return;
  }

  runtimeConfigured = true;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  if (Platform.OS === 'android') {
    void Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
      name: 'AhhbitTracker reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F15A22',
    });
  }
}

export async function scheduleNotification(plan: NotificationPlan): Promise<string> {
  const trigger: Notifications.NotificationTriggerInput = plan.deliverAt
    ? {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: plan.deliverAt,
      }
    : null;

  return Notifications.scheduleNotificationAsync({
    content: buildNotificationContent(plan),
    trigger,
  });
}

export async function cancelNotification(identifier: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

export async function openNotificationRoute(routePath: string): Promise<void> {
  const normalizedPath = routePath.startsWith('/') ? routePath : `/${routePath}`;
  await Linking.openURL(Linking.createURL(normalizedPath));
}

export function buildNotificationContent(plan: NotificationPlan): Notifications.NotificationContentInput {
  return {
    title: plan.title,
    body: plan.body,
    data: {
      kind: plan.kind,
      routePath: plan.routePath,
      habitId: plan.habitId ?? null,
      txId: plan.txId ?? null,
    },
  };
}

export function createNotificationRecord(plan: NotificationPlan, id: string): NotificationRecord {
  return {
    id,
    kind: plan.kind,
    tone: plan.tone,
    title: plan.title,
    body: plan.body,
    routePath: plan.routePath,
    createdAt: new Date().toISOString(),
    habitId: plan.habitId,
    txId: plan.txId,
  };
}