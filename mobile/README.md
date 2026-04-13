# AhhbitTracker Mobile

React Native (Expo) client for AhhbitTracker, structured with feature-first boundaries and shared core services.

## Architecture

```
mobile/src/
├── app/
│   ├── AppRoot.tsx               # Root composition (providers + screen shell)
│   ├── navigation/               # Typed stack/tab navigation, deep linking, route guards
│   ├── providers/                # Global providers (React Query + app state)
│   ├── state/                    # Reducer-based app state, selectors, persistence
│   └── screens/                  # Screen-level composition
├── core/
│   ├── config/                   # Runtime config and query constants
│   ├── data/                     # Contract read service layer
│   ├── network/                  # Stacks network selection
│   └── types/                    # Domain and contract interaction types
├── features/
│   ├── address/                  # Address state + address UI
│   ├── habits/                   # Habits query hooks and habit UI
│   ├── pool/                     # Pool balance UI
│   ├── wallet/                   # Wallet deep-link helpers and handoff UI
│   └── transactions/             # Transaction preview builders + UI
└── shared/
    ├── components/               # Reusable UI primitives/states
    ├── theme/                    # Design tokens
    └── utils/                    # Formatting and validation helpers
```

## Design Principles

- Feature-first ownership for vertical slices (`features/*`)
- Stable core contracts/network/config in `core/*`
- Shared reusable primitives only in `shared/*`
- Screen files orchestrate, feature files implement
- Wallet handoffs are modeled as session-scoped deep links, not persisted account state
- Legacy paths in `src/components`, `src/services`, etc. are maintained as re-export shims for compatibility

## Global State Management

- `AppStateProvider` composes reducer-driven global state with focused selector hooks
- State is split by concern:
    - Address lifecycle: tracked address + hydration status (persisted in AsyncStorage)
    - Transaction preview lifecycle: in-memory preview payload shared across tabs/screens
- Wallet deep-link state: Session-scoped preview payloads and return callbacks stay in memory only
- Query state remains in React Query; app state changes trigger cache pruning/invalidation for user-scoped keys
- Feature-level context exports remain as compatibility adapters and now delegate to app state hooks

## Navigation

- Root: Native stack with `MainTabs`, `HabitDetails`, and `CreateHabit`
- Tabs: `Overview`, `Habits`, `Preview`, and `Account`
- Deep links:
    - `ahhbittracker://overview`
    - `ahhbittracker://habits`
    - `ahhbittracker://habits/:habitId`
    - `ahhbittracker://habits/create`
    - `ahhbittracker://preview`
    - `ahhbittracker://account`
- Wallet deep-link payloads:
    - `ahhbittracker://preview?payload=...` for a serialized contract call preview
    - `ahhbittracker://preview?result=...` for a wallet return callback with `txId` and `status`
- The preview tab is the canonical wallet handoff surface for copying signing links and reviewing callback summaries
- Address-dependent routes are protected with a reusable guard component
- Transaction previews are shared between screens through a dedicated context provider

## Local Development

```bash
cd mobile
npm install
npm run start
```

## Environment and Network

Runtime configuration is sourced from Expo public env vars first, then `app.json` `expo.extra` values:

- `EXPO_PUBLIC_CONTRACT_ADDRESS`
- `EXPO_PUBLIC_CONTRACT_NAME`
- `EXPO_PUBLIC_HIRO_API_BASE_URL`
- `EXPO_PUBLIC_STACKS_NETWORK`

Defaults target mainnet AhhbitTracker contract values.
