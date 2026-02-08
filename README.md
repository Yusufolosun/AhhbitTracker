# AhhbitTracker

On-chain habit tracker with staking accountability on Stacks blockchain.

## Overview

AhhbitTracker helps users build lasting habits through blockchain-based accountability. Stake STX on your daily habits, check in every 24 hours to maintain your streak, and earn from a shared pool of forfeited stakes.

## Features

- Habit creation with STX staking
- Daily check-ins with streak tracking
- Automatic stake forfeiture for missed check-ins
- Withdrawal after successful completion
- Bonus pool for successful users

## Tech Stack

- Smart Contracts: Clarity
- Network: Stacks Mainnet
- Testing: Vitest
- Wallet Integration: @stacks/connect

## Getting Started

### Prerequisites

- Clarinet CLI
- Node.js and npm
- Stacks wallet

### Installation

```bash
npm install
```

### Testing

```bash
npm test
```

### Deployment

See [Deployment Guide](docs/DEPLOYMENT.md)

## Contract Functions

### Public Functions

- `create-habit` - Create new habit with stake
- `check-in` - Record daily check-in
- `withdraw-stake` - Withdraw after completion
- `claim-bonus` - Claim bonus from forfeited pool
- `slash-habit` - Forfeit expired habits to pool

### Read-Only Functions

- `get-habit` - Retrieve habit details
- `get-user-habits` - Get user's habit list
- `get-habit-streak` - Get current streak
- `get-forfeited-pool-balance` - Get pool balance
- `get-user-stats` - Get user statistics

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Post-Deployment](docs/POST_DEPLOYMENT.md)

## License

MIT

---


