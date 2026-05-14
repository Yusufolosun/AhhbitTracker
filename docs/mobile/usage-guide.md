# Mobile Developer Usage Guide

This guide provides best practices and common patterns for developers contributing to the AhhbitTracker mobile application.

## Best Practices

### 1. Feature Isolation
Always keep feature-specific logic within its module (`src/features/*`). Avoid importing components or hooks from other features directly; if logic needs to be shared, move it to `src/core/` or `src/shared/`.

### 2. Type Safety
Ensure all contract interaction types are correctly mapped from the Clarity interfaces. Use the `CV` conversion helpers provided by the Stacks SDK consistently.

### 3. Asynchronous Operations
Always provide visual feedback (loaders, skeletons) for async operations. Use the status indicators from React Query (`isLoading`, `isError`) to manage UI states.

### 4. Semantic UI
Use the design system primitives (`Card`, `ActionButton`, `MetricRow`) instead of raw React Native components whenever possible to maintain visual consistency.

## Common Patterns

### Creating a New Feature
1. Create a directory in `src/features/`.
2. Define types and interfaces.
3. Implement custom hooks for data fetching (React Query).
4. Build UI components by composing shared primitives.
5. Export the feature's public API via `index.ts`.

### Adding a New Screen
1. Define the screen in `src/app/screens/`.
2. Update `RootStackParamList` in `src/app/navigation/types.ts`.
3. Register the screen in the appropriate stack in `src/app/navigation/`.
