# Block Math & Window Calculations

The AhhbitTracker contract uses Stacks block height as the authoritative source of time for habit check-ins.

## Core Constants

- **Blocks per Day**: Approximately 144 blocks (based on a 10-minute target).
- **Check-In Window Start**: 96 blocks (approx. 16 hours) after the previous check-in.
- **Check-In Window End**: 192 blocks (approx. 32 hours) after the previous check-in.

## Window Calculation Logic

The mobile app calculates the current window status by comparing the latest block height ($H_{now}$) with the block height of the user's last check-in ($H_{last}$).

### Is Ready?
The user is "Ready" to check in if:
$H_{now} \ge H_{last} + 96$ AND $H_{now} \le H_{last} + 192$

### Is Late?
The user is "Late" if:
$H_{now} > H_{last} + 144$ (approx. 24 hours) but still within the window.

### Is Expired?
The window is "Expired" (missed) if:
$H_{now} > H_{last} + 192$

## Implementation

The `useHabitStatus` hook in `src/features/habits/hooks/` performs these calculations reactively as the block height updates via the Hiro API poll.
