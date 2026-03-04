# AhhbitTracker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Stacks](https://img.shields.io/badge/Stacks-Mainnet-5546FF)](https://www.stacks.co/)
[![Clarity](https://img.shields.io/badge/Clarity-v2-blue)](https://docs.stacks.co/clarity)
[![React](https://img.shields.io/badge/React-18-61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/Tests-29%2F29%20passing-brightgreen)](#testing)

> Build lasting habits with blockchain accountability. Stake STX, check in daily, earn rewards.

## Overview

AhhbitTracker is a decentralized habit-tracking dApp on the [Stacks](https://www.stacks.co/) blockchain. Users stake STX as a financial commitment to daily habits. Miss a day — your stake is forfeited to the shared pool. Complete a 7-day streak — reclaim your stake and earn bonuses from other users' forfeited stakes.

**Live contract:** [`SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker`](https://explorer.hiro.so/txid/SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker?chain=mainnet)

## How It Works

1. **Stake** — Create a habit and deposit ≥ 0.1 STX as your commitment
2. **Check In** — Record each daily completion within the 24-hour window (~144 Stacks blocks)
3. **Streak** — Maintain a 7-day streak to unlock withdrawal
4. **Withdraw** — Reclaim your stake and claim your share of the bonus pool

Missed check-ins slash the habit: your stake is sent to the shared bonus pool, distributed to users who completed their streaks.

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contract | Clarity 2.0 · Stacks Mainnet |
| Frontend | React 18 · TypeScript · Vite 5 · Tailwind CSS 3 |
| State Management | @tanstack/react-query 5 |
| Wallet Integration | @stacks/connect 7 (Leather · Xverse · Asigna) |
| Testing | Vitest + Clarinet SDK |
| Deployment | Vercel |

## Local Development

**Prerequisites:** Node.js ≥ 18, [Clarinet CLI](https://docs.hiro.so/clarinet/getting-started)

```bash
# Clone
git clone https://github.com/Yusufolosun/AhhbitTracker.git
cd AhhbitTracker

# Install root dependencies (contract testing)
npm install

# Install and start frontend
cd frontend
cp .env.example .env.local   # see Environment Variables below
npm install
npm run dev                  # → http://localhost:3000
```

### Testing

```bash
# Run all 29 contract tests
npm test

# Check Clarity contract syntax
clarinet check
```

### Production Build

```bash
cd frontend
npm run build    # output → frontend/dist/
npm run preview  # preview the production build locally
```

## Environment Variables

Copy `frontend/.env.example` to `frontend/.env.local` before running locally. **Never commit `.env.local`.**

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_CONTRACT_ADDRESS` | No | `SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193` | Deployed contract principal |
| `VITE_CONTRACT_NAME` | No | `habit-tracker` | Contract name |

## Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYusufolosun%2FAhhbitTracker&root=frontend)

1. Import the repository in [Vercel](https://vercel.com)
2. Set **Root Directory** → `frontend`
3. Build settings are auto-detected from `frontend/vercel.json`
4. Add any environment variable overrides from `frontend/.env.example`

All client-side routing is handled by the SPA rewrite rule in `vercel.json`. No additional server configuration required.

## Contract Reference

**Address:** `SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193`
**Network:** Stacks Mainnet
**Explorer:** [View on Hiro Explorer](https://explorer.hiro.so/txid/SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker?chain=mainnet)

### Public Functions

| Function | Parameters | Description |
|---|---|---|
| `create-habit` | `name: string-utf8`, `stake: uint` | Create a habit with STX stake |
| `check-in` | `habit-id: uint` | Record today's check-in |
| `withdraw-stake` | `habit-id: uint` | Reclaim stake after 7-day streak |
| `claim-bonus` | `habit-id: uint` | Claim share of forfeited pool |
| `slash-habit` | `habit-id: uint` | Forfeit an expired habit to the pool |

### Read-Only Functions

| Function | Returns |
|---|---|
| `get-habit` | Full habit record |
| `get-user-habits` | List of habit IDs owned by a principal |
| `get-habit-streak` | Current streak count |
| `get-pool-balance` | Total forfeited STX in the shared pool |
| `get-user-stats` | Aggregated stats per principal |

Full reference → [`docs/API_REFERENCE.md`](docs/API_REFERENCE.md)

## Security

- Post-condition validation on every STX transfer — transactions revert if amounts do not match
- Authorization checks: only the habit owner can check in, withdraw, or claim
- Input validation: name length, minimum stake, check-in timing enforced on-chain
- No private keys, mnemonics, or secrets in this repository

See [`docs/SECURITY.md`](docs/SECURITY.md) for the full security model.

## Documentation

| Document | Description |
|---|---|
| [Architecture](docs/ARCHITECTURE.md) | System design and data flow |
| [API Reference](docs/API_REFERENCE.md) | All contract functions and error codes |
| [Integration Guide](docs/INTEGRATION_GUIDE.md) | Connecting a custom frontend |
| [User Guide](docs/USER_GUIDE.md) | End-user walkthrough |
| [Tutorial](docs/TUTORIAL.md) | Step-by-step for first-time users |
| [FAQ](docs/FAQ.md) | Common questions |
| [Security](docs/SECURITY.md) | Security model |
| [Deployment](docs/DEPLOYMENT.md) | Contract deployment guide |

## Contributing

Pull requests are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a PR.

## License

[MIT](LICENSE) © [Yusufolosun](https://github.com/Yusufolosun)
