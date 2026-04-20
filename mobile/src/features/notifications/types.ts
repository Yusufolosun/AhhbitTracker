export type NotificationPermissionState = 'unknown' | 'granted' | 'denied' | 'undetermined';
export type NotificationTone = 'success' | 'warning' | 'danger' | 'info';

export type NotificationKind =
  | 'habit-check-in-reminder'
  | 'habit-check-in-urgent'
  | 'habit-check-in-expired'
  | 'habit-withdrawal-ready'
  | 'transaction-confirmed'
  | 'transaction-failed';

export interface NotificationPlan {
  key: string;
  kind: NotificationKind;
  tone: NotificationTone;
  title: string;
  body: string;
  routePath: string;
  habitId?: number;
  txId?: string;
  deliverAt?: Date;
}

export interface NotificationRecord {
  id: string;
  kind: NotificationKind;
  tone: NotificationTone;
  title: string;
  body: string;
  routePath: string;
  createdAt: string;
  habitId?: number;
  txId?: string;
}

export interface ScheduledReminderRecord {
  identifier: string;
  deliverAt: string;
}

export interface NotificationPreferences {
  remindersEnabled: boolean;
  eventAlertsEnabled: boolean;
}

export interface NotificationCenterState extends NotificationPreferences {
  permissionStatus: NotificationPermissionState;
  isHydrating: boolean;
  recentNotifications: NotificationRecord[];
  upcomingReminders: NotificationPlan[];
  scheduledReminders: Record<string, ScheduledReminderRecord>;
  deliveredEventKeys: string[];
  lastSyncedAt: string | null;
}

export interface PersistedNotificationCenterState extends NotificationPreferences {
  version: 1;
  recentNotifications: NotificationRecord[];
  scheduledReminders: Record<string, ScheduledReminderRecord>;
  deliveredEventKeys: string[];
}