# ahhbit-tracker-sdk

TypeScript SDK for interacting with the [AhhbitTracker](https://github.com/Yusufolosun/AhhbitTracker) smart contract on Stacks blockchain.

## Features

- Typed transaction builders for all contract functions
- Read-only query helpers with parsed return types
- Post-condition helpers (Deny mode by default)
- All on-chain constants and error codes
- Zero runtime dependencies (peer deps on `@stacks/transactions` and `@stacks/network`)
- ESM + CJS + full type declarations

## Install

```bash
npm install ahhbit-tracker-sdk @stacks/transactions @stacks/network
```

## Usage

### Transaction Builders

Build contract call arguments to pass to `openContractCall` or any Stacks transaction signer.

```typescript
import { buildCreateHabit, buildCheckIn, buildWithdrawStake, buildClaimBonus } from 'ahhbit-tracker-sdk';
import { openContractCall } from '@stacks/connect';

// Create a habit (stake 1 STX)
const tx = buildCreateHabit('Exercise daily', 1_000_000, senderAddress);
await openContractCall({ ...tx, network, onFinish: (data) => console.log(data.txId) });

// Daily check-in
await openContractCall({ ...buildCheckIn(habitId), network });

// Withdraw stake after 7-day streak
await openContractCall({ ...buildWithdrawStake(habitId, stakeAmount), network });

// Claim bonus from forfeited pool
await openContractCall({ ...buildClaimBonus(habitId), network });
```

### Read-Only Queries

```typescript
import { getHabit, getUserHabits, getPoolBalance, getUserStats } from 'ahhbit-tracker-sdk';
import { STACKS_MAINNET } from '@stacks/network';

const habit = await getHabit(1, STACKS_MAINNET);
// { owner, name, stakeAmount, currentStreak, lastCheckInBlock, ... }

const { habitIds } = await getUserHabits(address, STACKS_MAINNET);

const poolBalance = await getPoolBalance(STACKS_MAINNET);

const stats = await getUserStats(address, STACKS_MAINNET);
// { totalHabits, habitIds }
```

### Constants and Error Codes

```typescript
import {
  MAINNET_CONTRACT,
  MIN_STAKE_AMOUNT,
  CHECK_IN_WINDOW,
  ErrorCode,
  errorMessages,
} from 'ahhbit-tracker-sdk';

console.log(MAINNET_CONTRACT);
// { contractAddress: 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z', contractName: 'habit-tracker-v2' }

console.log(errorMessages[ErrorCode.ALREADY_CHECKED_IN]);
// 'Already checked in today'
```

### Custom Contract Deployment

All functions accept an optional contract override for testnet or custom deployments:

```typescript
const tx = buildCreateHabit('Meditate', 100_000, sender, {
  contractAddress: 'ST1MYADDRESS',
  contractName: 'my-habit-tracker',
});
```

## API

### Transaction Builders

| Function | Description |
|---|---|
| `buildCreateHabit(name, stakeAmount, sender, contract?)` | Create a new habit with STX stake |
| `buildCheckIn(habitId, contract?)` | Record daily check-in |
| `buildSlashHabit(habitId, contract?)` | Slash a habit that missed its window |
| `buildWithdrawStake(habitId, stakeAmount, contract?)` | Withdraw stake after 7-day streak |
| `buildClaimBonus(habitId, contract?)` | Claim bonus from forfeited pool |

### Read-Only Queries

| Function | Returns |
|---|---|
| `getHabit(habitId, network, contract?)` | `Habit \| null` |
| `getUserHabits(address, network, contract?)` | `UserHabits` |
| `getHabitStreak(habitId, network, contract?)` | `number` |
| `getPoolBalance(network, contract?)` | `number` (microSTX) |
| `getTotalHabits(network, contract?)` | `number` |
| `getUserStats(address, network, contract?)` | `UserStats` |

## Types

```typescript
interface Habit {
  owner: string;
  name: string;
  stakeAmount: number;
  currentStreak: number;
  lastCheckInBlock: number;
  createdAtBlock: number;
  isActive: boolean;
  isCompleted: boolean;
  bonusClaimed: boolean;
}
```

## License

[MIT](../../LICENSE)
