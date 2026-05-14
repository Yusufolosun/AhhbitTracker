# Notifications & Reminders

AhhbitTracker Mobile uses `expo-notifications` to help users stay consistent with their habits by providing timely reminders for check-in windows.

## Notification Types

### 1. Check-In Reminders
Scheduled locally when a habit's next check-in window is calculated. The app schedules a notification to fire shortly after the window opens.

### 2. Window Expiry Alerts
Urgent alerts scheduled to fire 10-15 blocks (approx. 100-150 minutes) before a check-in window closes, prompting the user to take action.

### 3. Achievement Alerts
Triggered when a user completes a milestone or maintains a significant streak.

## Scheduling Logic

Reminders are recalculated and rescheduled in the following scenarios:
- **Application Boot**: To ensure all scheduled notifications are up to date with the latest on-chain block height.
- **Successful Check-In**: To clear old reminders and schedule the next one.
- **Settings Change**: When the user toggles reminder preferences.

## Permission Handling

The app requests notification permissions during the onboarding flow or when the user first enables reminders in Settings. The permission status is tracked in the global `NotificationState`.
