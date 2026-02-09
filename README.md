# AhhbitTracker

On-chain habit tracker with staking accountability on Stacks blockchain.

## Overview

AhhbitTracker helps users build lasting habits through blockchain-based accountability. Stake STX on your daily habits, check in every 24 hours to maintain your streak, and earn from a shared pool of forfeited stakes.

## Deployment

**Status:** 🟢 Live on Mainnet

**Contract:** `SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker`

**Explorer:** [View on Stacks Explorer](https://explorer.hiro.so/txid/SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker?chain=mainnet)

## Features

- Habit creation with STX staking (min 0.1 STX)
- Daily check-ins with streak tracking (24-hour window)
- Automatic stake forfeiture for missed check-ins
- Withdrawal after 7-day streak completion
- Bonus pool distribution for successful users

## Tech Stack

- Smart Contracts: Clarity 2.0
- Network: Stacks Mainnet
- Testing: Vitest + Clarinet SDK
- Development: Clarinet CLI

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
- `get-pool-balance` - Get forfeited pool balance
- `get-total-habits` - Get total habits created
- `get-user-stats` - Get user statistics

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Post-Deployment](docs/POST_DEPLOYMENT.md)

## License

MIT

---


