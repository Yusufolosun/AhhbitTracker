# Design System & UI Primitives

AhhbitTracker Mobile uses a custom design system built with Vanilla React Native Stylesheets, prioritizing performance and visual consistency.

## Design Principles

- **Clarity & Focus**: The UI emphasizes habit metrics and check-in windows.
- **Visual Feedback**: Real-time status indicators (Active, Late, Ready) use distinct semantic colors.
- **Accessibility**: High contrast ratios and accessible touch targets.

## UI Components (`src/shared/components/`)

### `Card`
The foundational surface for information display. Supports elevation, padding, and custom borders.

### `ActionButton`
A versatile button component with support for different variants (Primary, Secondary, Ghost, Danger) and loading states.

### `MetricRow`
A standardized layout for displaying key-value pairs, commonly used for habit stats and transaction details.

### `StatusBadge`
A compact indicator used to show the current state of a habit (e.g., "Ready", "Checked In", "Missed").

## Composition Pattern

We prefer composition over configuration. Features build their specialized UI by composing these shared primitives.
