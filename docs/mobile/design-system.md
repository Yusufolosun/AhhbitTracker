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

## Theme Tokens (`src/styles/theme.ts`)

Our theme object centralizes design tokens for colors, spacing, and typography.

### Color Palette

- `primary`: The brand primary color (e.g., #5546FF).
- `background`: Global background color, optimized for dark/light modes.
- `surface`: Color for cards and elevated components.
- `success`, `warning`, `error`: Semantic colors for status indicators.

### Typography

We use a set of standardized text variants:
- `Heading1`, `Heading2`: For screen and section titles.
- `Body`, `BodySmall`: For general content.
- `Caption`: For supplementary information.

### Spacing Scale

Spacing is defined in an 8pt grid to ensure layout consistency.
`spacing.xs (4)`, `spacing.s (8)`, `spacing.m (16)`, `spacing.l (24)`, `spacing.xl (32)`.

