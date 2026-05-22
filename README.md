# AhhbitTracker

<p align="center">
  <img src="frontend/public/logos/full-logo-dark.jpg" alt="AhhbitTracker" width="320" />
</p>

<p align="center">
  <strong>On-chain habit tracking with accountability on Stacks</strong>
</p>

<p align="center">
  <a href="https://github.com/Yusufolosun/AhhbitTracker/actions/workflows/ci.yml"><img src="https://github.com/Yusufolosun/AhhbitTracker/actions/workflows/ci.yml/badge.svg" alt="CI" /></a>
  <a href="https://github.com/Yusufolosun/AhhbitTracker/actions/workflows/security-scan.yml"><img src="https://github.com/Yusufolosun/AhhbitTracker/actions/workflows/security-scan.yml/badge.svg" alt="Security Scan" /></a>
  <a href="https://www.npmjs.com/package/@yusufolosun/stx-utils"><img src="https://img.shields.io/npm/v/@yusufolosun/stx-utils?color=F15A22&label=stx-utils" alt="stx-utils on npm" /></a>
  <a href="https://explorer.hiro.so/address/SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z.habit-tracker-v3?chain=mainnet"><img src="https://img.shields.io/badge/Stacks-Mainnet-F15A22" alt="Stacks Mainnet" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-18-61DAFB" alt="React 18" /></a>
  <a href="https://docs.stacks.co/clarity"><img src="https://img.shields.io/badge/Clarity-v2-F15A22" alt="Clarity v2" /></a>
</p>

---

## Table of Contents

- [What is AhhbitTracker?](#what-is-ahhbittracker)
- [How It Works](#how-it-works)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Testing](#testing)
  - [External Packages](#external-packages)
  - [Production Build](#production-build)
- [Deploy to Vercel](#deploy-to-vercel)
- [Contract Reference](#contract-reference)
- [Security](#security)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

---

## What is AhhbitTracker?

AhhbitTracker is a habit-building app that uses the psychological power of **loss aversion** to keep you committed. By staking a small deposit of STX (a digital token secured by Bitcoin) on a daily habit, you create real financial accountability.

Here is the simple 30-second loop:
- **Set a Habit & Deposit**: Choose a daily habit (e.g. "Read 10 pages", "Workout", "Drink 3L Water") and lock in a small commitment deposit (as low as 0.02 STX).
- **Check In Daily**: Verify your habit completion every 16 to 32 hours.
- **Maintain your Streak**: Hit a 7-day streak to unlock and reclaim your deposit.
- **Claim Bonus Payouts**: Consistent users earn additional bonus payouts from a shared reward pool built from penalties of users who missed their habits!
- **Miss a Day, Take a Penalty**: If you miss a check-in window, a 10% penalty of your staked deposit is forfeited to the shared reward pool.

**Live contracts:**
- Main Tracker: [`SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z.habit-tracker-v3`](https://explorer.hiro.so/address/SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z.habit-tracker-v3?chain=mainnet)
- Accountability: [`SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z.habit-accountability-group-v3`](https://explorer.hiro.so/address/SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z.habit-accountability-group-v3?chain=mainnet)
- Streak Rewards: [`SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z.habit-streak-reward-v3`](https://explorer.hiro.so/address/SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z.habit-streak-reward-v3?chain=mainnet)

## How It Works

1. **Stake** — Create a habit and deposit ≥ 0.02 STX as your commitment
2. **Check In** — Record daily completion within the 16-32 hour window (96-192 blocks)
3. **Streak** — Maintain a 7-day streak to unlock withdrawal
4. **Withdraw** — Reclaim your stake and claim your share of the bonus pool
5. **Refer** — Register a referrer once; successful referrals boost future bonus shares

Missed windows forfeit 10% per missed window to the shared pool, distributed as rewards to users who complete their streaks.

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contract | Clarity 2.0 on Stacks Mainnet |
| Frontend | React 18 · TypeScript · Vite 5 · Tailwind CSS |
| State | @tanstack/react-query |
| Blockchain Read Sync | Layered read-through caching + transaction-aware invalidation |
| Wallet | @stacks/connect (Leather · Xverse · Asigna) |
| Testing | Vitest + Clarinet SDK |
| Deployment | Vercel |

## Getting Started

**Prerequisites:** Node.js ≥ 18, [Clarinet CLI](https://docs.hiro.so/clarinet/getting-started)

```bash
git clone https://github.com/Yusufolosun/AhhbitTracker.git
cd AhhbitTracker
npm install

cd frontend
cp .env.example .env.local
npm install
npm run dev                  # → http://localhost:3000
```

### Running Tests

If you want to verify the system locally, you can run the test suite:
```bash
npm test              # Run unit tests
cd frontend && npm test   # Run frontend tests
```

### External Packages
The project relies on these specialized packages for the Stacks ecosystem:
- [`stx-utils`](https://github.com/Yusufolosun/ahhbit-tracker-stx-utils): Zero-dependency utility library for Stacks (formatting, block math, address helpers)
- [`ahhbit-tracker-sdk`](https://github.com/Yusufolosun/ahhbit-tracker-sdk): Typed SDK for the contract (transactions, queries, post-conditions)
- [`defikit`](https://github.com/Yusufolosun/ahhbit-tracker-defikit): DeFi utility toolkit for basis points and fee math


## Contract Reference

| Function | Description |
|---|---|
| `register-referrer` | Register a referrer for bonus boosts |
| `create-habit` | Create a habit with STX stake |
| `check-in` | Record daily check-in |
| `withdraw-stake` | Reclaim stake after 7-day streak |
| `claim-bonus` | Claim share of forfeited pool |
| `get-habit` | Read habit details |
| `get-pool-balance` | View total forfeited STX |
| `get-unclaimed-completed-habits` | View pending bonus claimant count |
| `get-estimated-bonus-share` | View next estimated bonus share |
| `get-referral-boost` | View current referral bonus weight |

Full reference → [docs/API_REFERENCE.md](docs/API_REFERENCE.md)

## Security

- Post-condition validation on every STX transfer
- On-chain authorization — only habit owners can check in, withdraw, or claim
- Input validation enforced in the smart contract
- No private keys, mnemonics, or secrets in this repository

See [docs/SECURITY.md](docs/SECURITY.md) for the full security model.

## Documentation

| Document | Description |
|---|---|
| [User Guide](docs/USER_GUIDE.md) | End-user walkthrough |
| [API Reference](docs/API_REFERENCE.md) | Contract functions and error codes |
| [Architecture](docs/ARCHITECTURE.md) | System design and data flow |
| [Mobile Architecture](docs/mobile/README.md) | Mobile app design and setup |
| [FAQ](docs/FAQ.md) | Common questions |

| [Security](docs/SECURITY.md) | Security model |

## Contributing

Pull requests are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

[MIT](LICENSE)
