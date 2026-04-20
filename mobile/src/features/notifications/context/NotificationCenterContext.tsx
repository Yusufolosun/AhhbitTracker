import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';
import type { PropsWithChildren } from 'react';
import * as Notifications from 'expo-notifications';
import { trimNotificationHistory } from '@/features/notifications/storage';
import {
  loadPersistedNotificationState,
  savePersistedNotificationState,
} from '@/features/notifications/storage';
import {
  cancelNotification,
  configureNotificationRuntime,
  getNotificationPermissionState,
  openNotificationRoute,
  requestNotificationPermission,
  scheduleNotification,
} from '@/features/notifications/service';
import type {
  NotificationCenterState,
  NotificationPermissionState,
  NotificationPlan,
  NotificationRecord,
  PersistedNotificationCenterState,
  ScheduledReminderRecord,
} from '@/features/notifications/types';

type NotificationAction =
  | { type: 'hydrate:start' }
  | { type: 'hydrate:complete'; payload: PersistedNotificationCenterState | null }
  | { type: 'permission:set'; payload: { permissionStatus: NotificationPermissionState } }
  | { type: 'reminders:set'; payload: { remindersEnabled: boolean } }
  | { type: 'events:set'; payload: { eventAlertsEnabled: boolean } }
  | { type: 'reminders:plans'; payload: { upcomingReminders: NotificationPlan[] } }
  | { type: 'reminders:upsert'; payload: { key: string; reminder: ScheduledReminderRecord } }
  | { type: 'reminders:remove'; payload: { key: string } }
  | { type: 'notifications:record'; payload: { notification: NotificationRecord; eventKey: string } }
  | { type: 'notifications:clear' }
  | { type: 'sync:set'; payload: { lastSyncedAt: string | null } };

interface NotificationCenterContextValue {
  state: NotificationCenterState;
  refreshPermissionStatus: () => Promise<void>;
  enableAllNotifications: () => Promise<void>;
  setRemindersEnabled: (enabled: boolean) => Promise<void>;
  setEventAlertsEnabled: (enabled: boolean) => Promise<void>;
  syncScheduledReminders: (nextPlans: NotificationPlan[]) => Promise<void>;
  recordNotification: (eventKey: string, notification: NotificationRecord) => Promise<void>;
  clearNotificationHistory: () => Promise<void>;
}

const MAX_RECENT_NOTIFICATIONS = 25;

function trimDeliveredEventKeys(keys: string[]): string[] {
  return keys.slice(0, MAX_RECENT_NOTIFICATIONS * 2);
}

function createInitialNotificationState(): NotificationCenterState {
  return {
    permissionStatus: 'unknown',
    remindersEnabled: false,
    eventAlertsEnabled: false,
    isHydrating: true,
    recentNotifications: [],
    upcomingReminders: [],
    scheduledReminders: {},
    deliveredEventKeys: [],
    lastSyncedAt: null,
  };
}

function toPersistedState(state: NotificationCenterState): PersistedNotificationCenterState {
  return {
    version: 1,
    remindersEnabled: state.remindersEnabled,
    eventAlertsEnabled: state.eventAlertsEnabled,
    recentNotifications: trimNotificationHistory(state.recentNotifications),
    scheduledReminders: state.scheduledReminders,
    deliveredEventKeys: state.deliveredEventKeys.slice(0, MAX_RECENT_NOTIFICATIONS * 2),
  };
}

function notificationReducer(state: NotificationCenterState, action: NotificationAction): NotificationCenterState {
  switch (action.type) {
    case 'hydrate:start':
      return {
        ...state,
        isHydrating: true,
      };
    case 'hydrate:complete':
      return {
        ...state,
        isHydrating: false,
        remindersEnabled: action.payload?.remindersEnabled ?? false,
        eventAlertsEnabled: action.payload?.eventAlertsEnabled ?? false,
        recentNotifications: action.payload?.recentNotifications ?? [],
        scheduledReminders: action.payload?.scheduledReminders ?? {},
        deliveredEventKeys: action.payload?.deliveredEventKeys ?? [],
      };
    case 'permission:set':
      return {
        ...state,
        permissionStatus: action.payload.permissionStatus,
      };
    case 'reminders:set':
      return {
        ...state,
        remindersEnabled: action.payload.remindersEnabled,
      };
    case 'events:set':
      return {
        ...state,
        eventAlertsEnabled: action.payload.eventAlertsEnabled,
      };
    case 'reminders:plans':
      return {
        ...state,
        upcomingReminders: action.payload.upcomingReminders,
      };
    case 'reminders:upsert':
      return {
        ...state,
        scheduledReminders: {
          ...state.scheduledReminders,
          [action.payload.key]: action.payload.reminder,
        },
      };
    case 'reminders:remove': {
      const nextScheduledReminders = { ...state.scheduledReminders };
      delete nextScheduledReminders[action.payload.key];

      return {
        ...state,
        scheduledReminders: nextScheduledReminders,
      };
    }
    case 'notifications:record': {
      if (state.deliveredEventKeys.includes(action.payload.eventKey)) {
        return state;
      }

      return {
        ...state,
        recentNotifications: trimNotificationHistory([
          action.payload.notification,
          ...state.recentNotifications,
        ]),
        deliveredEventKeys: trimDeliveredEventKeys([
          action.payload.eventKey,
          ...state.deliveredEventKeys,
        ]),
      };
    }
    case 'notifications:clear':
      return {
        ...state,
        recentNotifications: [],
        deliveredEventKeys: [],
      };
    case 'sync:set':
      return {
        ...state,
        lastSyncedAt: action.payload.lastSyncedAt,
      };
    default:
      return state;
  }
}

const NotificationCenterContext = createContext<NotificationCenterContextValue | undefined>(undefined);

export function NotificationCenterProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(notificationReducer, undefined, createInitialNotificationState);

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      dispatch({ type: 'hydrate:start' });

      try {
        configureNotificationRuntime();

        const [persistedState, permissionStatus] = await Promise.all([
          loadPersistedNotificationState(),
          getNotificationPermissionState(),
        ]);

        if (!isMounted) {
          return;
        }

        dispatch({ type: 'hydrate:complete', payload: persistedState });
        dispatch({ type: 'permission:set', payload: { permissionStatus } });
      } catch {
        if (!isMounted) {
          return;
        }

        dispatch({ type: 'hydrate:complete', payload: null });
        dispatch({ type: 'permission:set', payload: { permissionStatus: 'unknown' } });
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

    void savePersistedNotificationState(toPersistedState(state));
  }, [state]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const routePath = String(response.notification.request.content.data?.routePath ?? '').trim();

      if (!routePath) {
        return;
      }

      void openNotificationRoute(routePath);
    });

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      const routePath = String(response?.notification.request.content.data?.routePath ?? '').trim();

      if (!routePath) {
        return;
      }

      void openNotificationRoute(routePath);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const refreshPermissionStatus = useCallback(async () => {
    const permissionStatus = await getNotificationPermissionState();
    dispatch({ type: 'permission:set', payload: { permissionStatus } });
  }, []);

  const ensurePermission = useCallback(async () => {
    const currentPermission = await getNotificationPermissionState();

    if (currentPermission === 'granted') {
      dispatch({ type: 'permission:set', payload: { permissionStatus: currentPermission } });
      return currentPermission;
    }

    const requestedPermission = await requestNotificationPermission();
    dispatch({ type: 'permission:set', payload: { permissionStatus: requestedPermission } });
    return requestedPermission;
  }, []);

  const enableAllNotifications = useCallback(async () => {
    const permissionStatus = await ensurePermission();

    if (permissionStatus !== 'granted') {
      throw new Error('Notification permission is required to enable reminders.');
    }

    dispatch({ type: 'reminders:set', payload: { remindersEnabled: true } });
    dispatch({ type: 'events:set', payload: { eventAlertsEnabled: true } });
  }, [ensurePermission]);

  const setRemindersEnabled = useCallback(
    async (enabled: boolean) => {
      if (enabled) {
        const permissionStatus = await ensurePermission();

        if (permissionStatus !== 'granted') {
          throw new Error('Notification permission is required to enable reminders.');
        }
      }

      if (!enabled) {
        for (const { identifier } of Object.values(state.scheduledReminders)) {
          await cancelNotification(identifier);
        }

        dispatch({ type: 'reminders:set', payload: { remindersEnabled: false } });

        for (const key of Object.keys(state.scheduledReminders)) {
          dispatch({ type: 'reminders:remove', payload: { key } });
        }

        return;
      }

      dispatch({ type: 'reminders:set', payload: { remindersEnabled: true } });
    },
    [ensurePermission, state.scheduledReminders],
  );

  const setEventAlertsEnabled = useCallback(
    async (enabled: boolean) => {
      if (enabled) {
        const permissionStatus = await ensurePermission();

        if (permissionStatus !== 'granted') {
          throw new Error('Notification permission is required to enable important event alerts.');
        }
      }

      dispatch({ type: 'events:set', payload: { eventAlertsEnabled: enabled } });
    },
    [ensurePermission],
  );

  const syncScheduledReminders = useCallback(
    async (nextPlans: NotificationPlan[]) => {
      dispatch({ type: 'reminders:plans', payload: { upcomingReminders: nextPlans } });

      if (!state.remindersEnabled || state.permissionStatus !== 'granted') {
        for (const { identifier } of Object.values(state.scheduledReminders)) {
          await cancelNotification(identifier);
        }

        for (const key of Object.keys(state.scheduledReminders)) {
          dispatch({ type: 'reminders:remove', payload: { key } });
        }

        return;
      }

      const desiredPlanMap = new Map(
        nextPlans
          .filter((plan) => plan.deliverAt instanceof Date && plan.deliverAt.getTime() > Date.now())
          .map((plan) => [plan.key, plan]),
      );

      for (const [key, existingReminder] of Object.entries(state.scheduledReminders)) {
        const desiredPlan = desiredPlanMap.get(key);

        if (!desiredPlan) {
          await cancelNotification(existingReminder.identifier);
          dispatch({ type: 'reminders:remove', payload: { key } });
          continue;
        }

        if (existingReminder.deliverAt === desiredPlan.deliverAt?.toISOString()) {
          continue;
        }

        await cancelNotification(existingReminder.identifier);
        dispatch({ type: 'reminders:remove', payload: { key } });
      }

      for (const [key, plan] of desiredPlanMap.entries()) {
        const existingReminder = state.scheduledReminders[key];

        if (existingReminder && existingReminder.deliverAt === plan.deliverAt?.toISOString()) {
          continue;
        }

        if (!plan.deliverAt) {
          continue;
        }

        const identifier = await scheduleNotification(plan);
        dispatch({
          type: 'reminders:upsert',
          payload: { key, reminder: { identifier, deliverAt: plan.deliverAt.toISOString() } },
        });
      }

      dispatch({ type: 'sync:set', payload: { lastSyncedAt: new Date().toISOString() } });
    },
    [state.permissionStatus, state.remindersEnabled, state.scheduledReminders],
  );

  const recordNotification = useCallback(async (eventKey: string, notification: NotificationRecord) => {
    dispatch({ type: 'notifications:record', payload: { eventKey, notification } });
  }, []);

  const clearNotificationHistory = useCallback(async () => {
    dispatch({ type: 'notifications:clear' });
  }, []);

  const value = useMemo<NotificationCenterContextValue>(
    () => ({
      state,
      refreshPermissionStatus,
      enableAllNotifications,
      setRemindersEnabled,
      setEventAlertsEnabled,
      syncScheduledReminders,
      recordNotification,
      clearNotificationHistory,
    }),
    [
      state,
      refreshPermissionStatus,
      enableAllNotifications,
      setRemindersEnabled,
      setEventAlertsEnabled,
      syncScheduledReminders,
      recordNotification,
      clearNotificationHistory,
    ],
  );

  return <NotificationCenterContext.Provider value={value}>{children}</NotificationCenterContext.Provider>;
}

export function useNotificationCenter() {
  const context = useContext(NotificationCenterContext);

  if (!context) {
    throw new Error('useNotificationCenter must be used within NotificationCenterProvider');
  }

  return context;
}