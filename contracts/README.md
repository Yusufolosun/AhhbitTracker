# AhhbitTracker Smart Contracts

## Overview

Core Clarity smart contract for on-chain habit tracking with staking.

## Contract: habit-tracker.clar

### Public Functions

#### create-habit
Creates a new habit with stake commitment.

**Parameters:**
- `name` (string-utf8 50) - Habit description
- `stake-amount` (uint) - Amount in microSTX

**Returns:** habit-id (uint)

**Errors:**
- `ERR-INVALID-STAKE-AMOUNT` - Stake below minimum
- `ERR-INVALID-HABIT-NAME` - Invalid name format

#### check-in
Records daily check-in for a habit.

**Parameters:**
- `habit-id` (uint) - ID of the habit

**Returns:** Updated streak count (uint)

**Errors:**
- `ERR-HABIT-NOT-FOUND` - Habit doesn't exist
- `ERR-NOT-HABIT-OWNER` - Caller not owner
- `ERR-ALREADY-CHECKED-IN` - Already checked in today
- `ERR-CHECK-IN-WINDOW-EXPIRED` - Missed check-in window

#### withdraw-stake
Withdraws stake after completing minimum streak.

**Parameters:**
- `habit-id` (uint) - ID of the habit

**Returns:** Withdrawn amount (uint)

**Errors:**
- `ERR-INSUFFICIENT-STREAK` - Streak below minimum
- `ERR-HABIT-ALREADY-COMPLETED` - Already withdrawn

#### claim-bonus
Claims bonus from forfeited pool.

**Parameters:**
- `habit-id` (uint) - Completed habit for eligibility

**Returns:** Bonus amount (uint)

**Errors:**
- `ERR-POOL-INSUFFICIENT-BALANCE` - Pool empty

#### slash-habit
Forfeits expired habit stake to pool.

**Parameters:**
- `habit-id` (uint) - Expired habit to slash

**Returns:** Success boolean

**Errors:**
- `ERR-HABIT-NOT-FOUND` - Habit doesn't exist
- `ERR-HABIT-ALREADY-COMPLETED` - Habit already inactive

### Read-Only Functions

#### get-habit
Retrieves habit details by ID.

**Parameters:** `habit-id` (uint)  
**Returns:** Habit data or none

#### get-user-habits
Gets all habit IDs for a user.

**Parameters:** `user` (principal)  
**Returns:** List of habit IDs

#### get-habit-streak
Gets current streak for a habit.

**Parameters:** `habit-id` (uint)  
**Returns:** Streak count

#### get-forfeited-pool-balance
Gets total balance in forfeited pool.

**Returns:** Pool balance in microSTX

#### get-user-stats
Gets aggregated statistics for a user.

**Parameters:** `user` (principal)  
**Returns:** Stats tuple with habit count and IDs

## Constants

- `MIN-STAKE-AMOUNT`: 100,000 microSTX (0.1 STX)
- `MAX-HABIT-NAME-LENGTH`: 50 characters
- `CHECK-IN-WINDOW`: 144 blocks (~24 hours)
- `MIN-STREAK-FOR-WITHDRAWAL`: 7 days

## Data Structures

### habits map
Stores individual habit data keyed by habit-id.

### user-habits map
Links users to their habit IDs.

### Data Variables
- `habit-id-nonce` - Counter for generating unique IDs
- `forfeited-pool-balance` - Total STX in forfeiture pool

## Testing

```bash
npm test
```

## Deployment

See main [Deployment Guide](../docs/DEPLOYMENT.md)
