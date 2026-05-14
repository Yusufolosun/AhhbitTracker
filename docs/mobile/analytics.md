# Analytics & Event Tracking

AhhbitTracker Mobile includes a lightweight, typed analytics layer to track product usage and identify friction points in the user journey.

## Analytics Strategy

Our analytics approach focuses on:
- **Privacy-First**: No personally identifiable information (PII) or blockchain private keys are ever tracked.
- **Event-Driven**: We track specific user actions rather than continuous session telemetry.
- **Typed Events**: All events are defined in `src/types/analytics.ts` to ensure consistency.

## Tracked Events

### Navigation
- `SCREEN_VIEW`: Tracked when a user enters a new screen.
- `TAB_CHANGE`: Tracked when switching between main dashboard tabs.

### Habit Lifecycle
- `HABIT_CREATED`: Tracked when a user successfully generates a creation preview.
- `CHECKIN_INITIATED`: Tracked when a user starts the check-in flow.
- `WITHDRAWAL_INITIATED`: Tracked when a user starts a withdrawal.

### Wallet & Transactions
- `ADDRESS_CONNECTED`: Tracked when a user first enters a Stacks address.
- `TRANSACTION_HANDOFF`: Tracked when the user is redirected to an external wallet.
- `TRANSACTION_RESULT`: Tracked when the app receives a callback from the wallet.

## Implementation (`src/analytics/`)

The `AnalyticsService` provides a simple `trackEvent(name, properties)` method that handles queuing and delivery to the configured analytics endpoint defined in `EXPO_PUBLIC_ANALYTICS_ENDPOINT`.
