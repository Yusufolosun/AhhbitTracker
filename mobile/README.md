# AhhbitTracker Mobile

React Native (Expo) client for AhhbitTracker, structured with feature-first boundaries and shared core services.

## Architecture

```
mobile/src/
├── app/
│   ├── AppRoot.tsx               # Root composition (providers + screen shell)
│   ├── providers/                # Global providers (React Query + app context)
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
- Legacy paths in `src/components`, `src/services`, etc. are maintained as re-export shims for compatibility

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
