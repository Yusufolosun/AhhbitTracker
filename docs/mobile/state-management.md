# State Management Architecture

AhhbitTracker Mobile employs a dual-layered state management strategy to handle both server-side (on-chain) data and local UI state efficiently.

## 1. Server State with React Query

We use `@tanstack/react-query` to manage all data fetched from the Stacks blockchain and Hiro API.

### Key Benefits
- **Automatic Caching**: Habit data and balances are cached and refreshed automatically.
- **Loading/Error States**: Hooks provide consistent status indicators.
- **Query Invalidation**: On-chain actions (like a successful check-in) trigger cache invalidation to ensure UI consistency.

## 2. Local State with Reducers

Global application state that doesn't originate from an API (e.g., tracked address, theme preference, transaction preview payload) is managed via React Context and Reducers.

### State Domains
- **Address Lifecycle**: Manages the current tracked Stacks address and its hydration status from storage.
- **Transaction Lifecycle**: A session-scoped state that holds the payload for the current pending transaction.
- **Notification State**: Tracks permission status and recent alert history.

## State Persistence

Critical application state is persisted to device storage using `@react-native-async-storage/async-storage`.

### Persisted Keys
- `ahhbit_tracked_address`: The Stacks address the user is currently tracking.
- `ahhbit_notifications_enabled`: User preference for reminders.
- `ahhbit_onboarding_complete`: Flag to skip onboarding flow.

### Hydration Flow

During the application boot process, the `AppRoot` component initializes the storage service and hydrates the global state before rendering the main navigation stack. This ensures that the user's tracked address and preferences are available immediately on launch.


## 3. Component State

Standard React `useState` and `useReducer` are used for localized UI logic that doesn't need to be shared across features (e.g., form inputs, modal visibility).
