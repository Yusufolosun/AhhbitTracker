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

## 3. Component State

Standard React `useState` and `useReducer` are used for localized UI logic that doesn't need to be shared across features (e.g., form inputs, modal visibility).
