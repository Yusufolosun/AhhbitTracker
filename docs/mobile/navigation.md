# Navigation & Routing

AhhbitTracker Mobile uses `@react-navigation/native` with a typed Native Stack for high-performance transitions and complete TypeScript safety across the application.

## Navigation Architecture

The navigation is split into two main layers:

1.  **Root Stack**: Handles high-level flows like `Onboarding`, `MainTabs`, and global modals like `HabitDetails` or `TransactionPreview`.
2.  **Main Tabs**: Provides the primary navigation interface with tabs for `Overview`, `Habits`, `Activity`, and `Settings`.

## TypeScript Integration

All routes and their parameters are defined in a centralized `RootStackParamList`.

```typescript
export type RootStackParamList = {
  MainTabs: undefined;
  HabitDetails: { habitId: number };
  CreateHabit: undefined;
  TransactionPreview: { payload: TransactionPayload };
};
```

This ensures that `navigation.navigate()` calls are checked at compile-time for correct route names and parameter types.

## Route Guards

The `AddressGuard` component is used to wrap routes that require a tracked address. If no address is found in state, the user is automatically redirected to the `ConnectAddress` screen.

## Deep Linking

AhhbitTracker Mobile supports deep linking via the `ahhbittracker://` scheme.

### URL Schemes

- `ahhbittracker://overview`: Direct access to the main dashboard.
- `ahhbittracker://habits`: View the habit list.
- `ahhbittracker://habits/:habitId`: Open details for a specific habit.
- `ahhbittracker://preview`: View the current pending transaction.

### Wallet Callback Integration

The app uses deep links to handle callbacks from Stacks wallets after transaction signing. The `TransactionPreview` screen listens for `result` and `txId` parameters to update the transaction status in the UI.

