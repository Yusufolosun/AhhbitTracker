# Mobile Architecture Overview

The AhhbitTracker mobile application is built using React Native and Expo, following a modular, feature-first architecture designed for scalability, maintainability, and seamless blockchain integration.

## Core Pillars

1.  **Feature-First Boundaries**: Logic is encapsulated within feature modules (`src/features/*`), promoting vertical slicing and reducing coupling between domains.
2.  **Shared Core Services**: Centralized logic for blockchain interaction, network configuration, and data fetching resides in the `src/core/` and `src/services/` layers.
3.  **Typed Navigation**: A centralized navigation system with strict TypeScript safety for routes and parameters.
4.  **Async State Management**: Leveraging React Query for server (on-chain) state and a reducer-based pattern for local application state.

## Folder Structure

- `src/app/`: Root application composition, providers, and global navigation.
- `src/core/`: Base abstractions, blockchain constants, and network drivers.
- `src/features/`: Domain-specific logic (Habits, Wallet, Notifications, etc.).
- `src/services/`: High-level API and contract interaction services.
- `src/shared/`: Reusable UI components, design tokens, and utility functions.
- `src/types/`: Centralized TypeScript definitions.
