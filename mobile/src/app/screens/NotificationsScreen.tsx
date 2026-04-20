import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAddressState } from '@/app/state';
import { useNotificationCenter } from '@/features/notifications/context/NotificationCenterContext';
import { ActionButton, Card, EmptyState, InteractionStatusBanner, MetricRow, Screen, SectionHeader } from '@/shared/components';
import { useInteractionStatus } from '@/shared/hooks/useInteractionStatus';
import { palette, spacing, typography } from '@/shared/theme';

type PendingAction = 'enable-all' | 'toggle-reminders' | 'toggle-events' | 'refresh' | 'clear' | null;

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function toCardTone(value: string) {
  if (value === 'success') {
    return 'success' as const;
  }

  if (value === 'warning') {
    return 'warning' as const;
  }

  if (value === 'danger') {
    return 'danger' as const;
  }

  return 'default' as const;
}

function toStatusTone(value: string) {
  if (value === 'granted') {
    return 'success' as const;
  }

  if (value === 'denied') {
    return 'danger' as const;
  }

  return 'warning' as const;
}

export function NotificationsScreen() {
  const { activeAddress } = useAddressState();
  const {
    state,
    enableAllNotifications,
    setRemindersEnabled,
    setEventAlertsEnabled,
    refreshPermissionStatus,
    clearNotificationHistory,
  } = useNotificationCenter();
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const { status, showError, showSuccess } = useInteractionStatus();

  const upcomingReminders = state.upcomingReminders.filter(
    (plan) => plan.deliverAt instanceof Date && plan.deliverAt.getTime() > Date.now(),
  );

  const runAction = async (action: PendingAction, callback: () => Promise<void>, successMessage: string) => {
    setPendingAction(action);

    try {
      await callback();
      showSuccess(successMessage);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update notification settings.';
      showError(message);
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <Screen contentContainerStyle={styles.content}>
      <SectionHeader
        title="Notifications"
        subtitle="Schedule check-in reminders and important event alerts"
      />

      <InteractionStatusBanner status={status} />

      <Card>
        <MetricRow label="Permission" value={state.permissionStatus} tone={toStatusTone(state.permissionStatus)} />
        <MetricRow label="Tracked address" value={activeAddress ? 'Active' : 'Not saved'} tone={activeAddress ? 'success' : 'warning'} />
        <MetricRow label="Reminders" value={state.remindersEnabled ? 'Enabled' : 'Disabled'} tone={state.remindersEnabled ? 'success' : 'warning'} />
        <MetricRow label="Event alerts" value={state.eventAlertsEnabled ? 'Enabled' : 'Disabled'} tone={state.eventAlertsEnabled ? 'success' : 'warning'} />
        <MetricRow label="Upcoming reminders" value={upcomingReminders.length} tone={upcomingReminders.length > 0 ? 'accent' : 'default'} />
        <MetricRow label="Recent alerts" value={state.recentNotifications.length} tone={state.recentNotifications.length > 0 ? 'accent' : 'default'} />
        <MetricRow
          label="Last sync"
          value={state.lastSyncedAt ? formatDateTime(state.lastSyncedAt) : 'Waiting for the next refresh'}
        />
      </Card>

      <View style={styles.actions}>
        {state.remindersEnabled || state.eventAlertsEnabled ? null : (
          <ActionButton
            label="Enable notifications"
            fullWidth
            loading={pendingAction === 'enable-all'}
            loadingLabel="Enabling"
            onPress={() => void runAction('enable-all', enableAllNotifications, 'Notifications enabled.')}
          />
        )}

        <ActionButton
          label={state.remindersEnabled ? 'Disable reminders' : 'Enable reminders'}
          variant="secondary"
          fullWidth
          loading={pendingAction === 'toggle-reminders'}
          loadingLabel="Saving"
          onPress={() =>
            void runAction(
              'toggle-reminders',
              () => setRemindersEnabled(!state.remindersEnabled),
              state.remindersEnabled ? 'Reminder scheduling disabled.' : 'Reminder scheduling enabled.',
            )
          }
        />

        <ActionButton
          label={state.eventAlertsEnabled ? 'Disable event alerts' : 'Enable event alerts'}
          variant="secondary"
          fullWidth
          loading={pendingAction === 'toggle-events'}
          loadingLabel="Saving"
          onPress={() =>
            void runAction(
              'toggle-events',
              () => setEventAlertsEnabled(!state.eventAlertsEnabled),
              state.eventAlertsEnabled ? 'Important event alerts disabled.' : 'Important event alerts enabled.',
            )
          }
        />

        <ActionButton
          label="Refresh permission status"
          variant="secondary"
          fullWidth
          loading={pendingAction === 'refresh'}
          loadingLabel="Refreshing"
          onPress={() => void runAction('refresh', refreshPermissionStatus, 'Permission status refreshed.')}
        />

        <ActionButton
          label="Clear recent alerts"
          variant="destructive"
          fullWidth
          loading={pendingAction === 'clear'}
          loadingLabel="Clearing"
          onPress={() => void runAction('clear', clearNotificationHistory, 'Recent alerts cleared.')}
          disabled={!state.recentNotifications.length}
        />
      </View>

      <View style={styles.sectionSpacing}>
        <SectionHeader
          title="Upcoming reminders"
          subtitle="These reminders will stay scheduled while notifications are enabled"
        />

        {upcomingReminders.length ? (
          upcomingReminders.map((plan) => (
            <Card key={plan.key} tone={toCardTone(plan.tone)} style={styles.reminderCard}>
              <Text style={styles.cardTitle}>{plan.title}</Text>
              <Text style={styles.cardBody}>{plan.body}</Text>
              <Text style={styles.cardMeta}>
                {plan.deliverAt ? `Scheduled for ${formatDateTime(plan.deliverAt.toISOString())}` : 'Scheduled now'}
              </Text>
            </Card>
          ))
        ) : (
          <EmptyState
            message={
              activeAddress
                ? 'No reminder plans are queued right now.'
                : 'Save a tracked address to generate reminder plans.'
            }
          />
        )}
      </View>

      <View style={styles.sectionSpacing}>
        <SectionHeader title="Recent alerts" subtitle="Important events recorded by the app" />

        {state.recentNotifications.length ? (
          state.recentNotifications.map((notification) => (
            <Card key={notification.id} tone={toCardTone(notification.tone)} style={styles.reminderCard}>
              <Text style={styles.cardTitle}>{notification.title}</Text>
              <Text style={styles.cardBody}>{notification.body}</Text>
              <Text style={styles.cardMeta}>{formatDateTime(notification.createdAt)}</Text>
            </Card>
          ))
        ) : (
          <EmptyState message="No alerts have been recorded yet." />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
  },
  actions: {
    gap: spacing.sm,
  },
  sectionSpacing: {
    marginTop: spacing.sm,
  },
  reminderCard: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    color: palette.ink,
    fontSize: typography.body,
    fontWeight: '700',
  },
  cardBody: {
    color: palette.slate,
    fontSize: typography.body,
    lineHeight: 21,
  },
  cardMeta: {
    color: palette.steel,
    fontSize: typography.label,
    fontWeight: '600',
  },
});