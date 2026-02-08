# AhhbitTracker Smart Contracts

## Overview

This directory contains the Clarity smart contracts for AhhbitTracker.

## Contract: habit-tracker.clar

The core contract managing habit creation, check-ins, stake management, and reward distribution.

### Key Features

- **Habit Creation**: Users stake STX on habit goals
- **Daily Check-ins**: On-chain verification within 24-hour windows
- **Streak Tracking**: Automated streak counting and validation
- **Stake Forfeiture**: Missed check-ins forfeit stakes to shared pool
- **Reward Distribution**: Successful users claim from forfeited pool

### Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `MIN-STAKE-AMOUNT` | 100,000 microSTX (0.1 STX) | Minimum stake per habit |
| `MAX-HABIT-NAME-LENGTH` | 50 characters | Maximum habit name length |
| `CHECK-IN-WINDOW` | 144 blocks (~24 hours) | Time window for valid check-in |
| `MIN-STREAK-FOR-WITHDRAWAL` | 7 days | Minimum streak to withdraw stake |

### Data Structures

#### habits map
Stores individual habit data keyed by `habit-id`

**Fields:**
- `owner`: Principal who created the habit
- `name`: Habit description
- `stake-amount`: Amount staked in microSTX
- `current-streak`: Days of consecutive check-ins
- `last-check-in-block`: Block height of last check-in
- `created-at-block`: Block height when created
- `is-active`: Whether habit is currently active
- `is-completed`: Whether habit has been successfully completed

#### user-habits map
Links users to their habit IDs for efficient querying

#### Data Variables
- `habit-id-nonce`: Counter for generating unique habit IDs
- `forfeited-pool-balance`: Total STX available in forfeiture pool

### Error Codes

| Code | Constant | Meaning |
|------|----------|---------|
| 100 | `ERR-NOT-AUTHORIZED` | Caller lacks permission |
| 101 | `ERR-INVALID-STAKE-AMOUNT` | Stake below minimum |
| 102 | `ERR-INVALID-HABIT-NAME` | Name too long or empty |
| 103 | `ERR-HABIT-NOT-FOUND` | Habit ID doesn't exist |
| 104 | `ERR-NOT-HABIT-OWNER` | Caller doesn't own habit |
| 105 | `ERR-ALREADY-CHECKED-IN` | Already checked in today |
| 106 | `ERR-CHECK-IN-WINDOW-EXPIRED` | Missed 24hr window |
| 107 | `ERR-INSUFFICIENT-STREAK` | Streak too short to withdraw |
| 108 | `ERR-HABIT-ALREADY-COMPLETED` | Habit marked complete |
| 109 | `ERR-POOL-INSUFFICIENT-BALANCE` | Pool lacks funds |
| 110 | `ERR-TRANSFER-FAILED` | STX transfer error |

## Implemented Functions

### Public Functions

| Function | Parameters | Returns | Description | Events |
|----------|-----------|---------|-------------|--------|
| `create-habit` | `name: string`, `stake-amount: uint` | `habit-id` | Create new habit with stake | `habit-created` |
| `check-in` | `habit-id: uint` | `current-streak` | Daily check-in | `habit-checked-in` |
| `withdraw-stake` | `habit-id: uint` | `stake-amount` | Withdraw after min streak | `stake-withdrawn` |
| `claim-bonus` | `habit-id: uint` | `bonus-amount` | Claim from forfeited pool | `bonus-claimed` |

### Read-Only Functions

| Function | Parameters | Returns | Description |
|----------|-----------|---------|-------------|
| `get-habit` | `habit-id: uint` | `habit-data` | Get habit details |
| `get-user-habits` | `user: principal` | `habit-ids` | Get all user habits |
| `get-habit-streak` | `habit-id: uint` | `streak-count` | Get current streak |
| `get-pool-balance` | - | `balance` | Get forfeited pool total |
| `get-total-habits` | - | `count` | Get total habits created |
| `get-user-stats` | `user: principal` | `stats-tuple` | Get aggregated user stats |

## Development

### Testing
```bash
clarinet test
```

### Deployment

See `docs/DEPLOYMENT.md` for mainnet deployment instructions.

## Security Considerations

- All stake transfers use Clarity's built-in `stx-transfer?`
- No centralized admin functions to withdraw user stakes
- Forfeited pool only accessible to successful users
- Immutable after deployment (no upgrade mechanism)
