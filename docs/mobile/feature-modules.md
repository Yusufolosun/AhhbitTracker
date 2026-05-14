# Feature Module Design Pattern

AhhbitTracker Mobile uses a feature-first architecture to organize logic into vertical slices. Each directory under `src/features/` represents a self-contained domain.

## Module Structure

A typical feature module follows this structure:

```
src/features/[feature-name]/
├── components/       # UI components specific to this feature
├── hooks/            # Custom hooks for logic/data fetching
├── api/              # API calls or contract interactions (if specific)
├── types/            # TypeScript definitions for the feature
├── utils/            # Helper functions for the feature
└── index.ts          # Public API for the module
```

## Core Feature Modules

### `src/features/habits/`
Handles the core habit lifecycle: creation, check-ins, and withdrawals. It includes hooks for fetching habit lists and calculating check-in window status.

### `src/features/wallet/`
Manages the user's Stacks address, balance display, and integration with the Stacks wallet for transaction signing.

### `src/features/notifications/`
Orchestrates local reminders and push notifications based on habit check-in windows.

### `src/features/transactions/`
Provides the logic for building transaction payloads and managing the "Transaction Preview" state before handoff to the wallet.
