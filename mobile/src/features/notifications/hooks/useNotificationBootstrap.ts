import { useEffect, useRef } from 'react';
import { useAddressState } from '@/app/state';
import { useCurrentBlockQuery, useUserHabitsQuery } from '@/features/habits';
import { useNotificationCenter } from '@/features/notifications/context/NotificationCenterContext';
import {
  buildHabitNotificationPlans,
  toNotificationRecord,
} from '@/features/notifications/planner';
import {
  scheduleNotification,
} from '@/features/notifications/service';

export function useNotificationBootstrap() {
  const { activeAddress, isHydrating } = useAddressState();
  const habitsQuery = useUserHabitsQuery(activeAddress);
  const currentBlockQuery = useCurrentBlockQuery();
  const notificationCenter = useNotificationCenter();
  const notificationStateRef = useRef(notificationCenter.state);
  const syncScheduledRemindersRef = useRef(notificationCenter.syncScheduledReminders);
  const recordNotificationRef = useRef(notificationCenter.recordNotification);

  useEffect(() => {
    notificationStateRef.current = notificationCenter.state;
  }, [notificationCenter.state]);

  useEffect(() => {
    syncScheduledRemindersRef.current = notificationCenter.syncScheduledReminders;
  }, [notificationCenter.syncScheduledReminders]);

  useEffect(() => {
    recordNotificationRef.current = notificationCenter.recordNotification;
  }, [notificationCenter.recordNotification]);

  useEffect(() => {
    let cancelled = false;

    const syncNotifications = async () => {
      if (isHydrating || notificationStateRef.current.isHydrating) {
        return;
      }

      if (!activeAddress) {
        await syncScheduledRemindersRef.current([]);
        return;
      }

      if (habitsQuery.isLoading || currentBlockQuery.isLoading) {
        return;
      }

      const currentBlock = currentBlockQuery.data ?? null;

      if (currentBlock === null) {
        return;
      }

      const upcomingReminders = [] as ReturnType<typeof buildHabitNotificationPlans>['upcomingReminders'];
      const immediateNotifications = [] as ReturnType<typeof buildHabitNotificationPlans>['immediateNotifications'];

      for (const habit of habitsQuery.data ?? []) {
        const plans = buildHabitNotificationPlans({
          address: activeAddress,
          habit,
          currentBlock,
        });

        upcomingReminders.push(...plans.upcomingReminders);
        immediateNotifications.push(...plans.immediateNotifications);
      }

      if (cancelled) {
        return;
      }

      await syncScheduledRemindersRef.current(upcomingReminders);

      const notificationState = notificationStateRef.current;

      if (!notificationState.eventAlertsEnabled || notificationState.permissionStatus !== 'granted') {
        return;
      }

      for (const plan of immediateNotifications) {
        if (cancelled || notificationState.deliveredEventKeys.includes(plan.key)) {
          continue;
        }

        const identifier = await scheduleNotification(plan);
        await recordNotificationRef.current(plan.key, toNotificationRecord(plan, identifier));
      }
    };

    void syncNotifications().catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, [
    activeAddress,
    currentBlockQuery.data,
    currentBlockQuery.isLoading,
    habitsQuery.data,
    habitsQuery.isLoading,
    isHydrating,
  ]);
}