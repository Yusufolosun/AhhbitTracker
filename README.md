# AhhbitTracker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Stacks](https://img.shields.io/badge/Stacks-Mainnet-5546FF)](https://www.stacks.co/)
[![Clarity](https://img.shields.io/badge/Clarity-v2-blue)](https://docs.stacks.co/clarity)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018-61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6)](https://www.typescriptlang.org/)

Build lasting habits with blockchain accountability. Stake STX, track streaks, earn rewards.

## 🚀 Live Application

**Frontend:** Full React dApp with wallet integration  
**Contract:** `SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker`  
**Status:** 🟢 Production Ready - Mainnet Deployment  
**Explorer:** [View on Stacks Explorer](https://explorer.hiro.so/txid/SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker?chain=mainnet)

## Overview

AhhbitTracker leverages blockchain technology to create financial accountability for habit formation. Users stake STX tokens on daily habits, check in every 24 hours to maintain streaks, and earn rewards from a shared pool of forfeited stakes.

**Current Stats:**
- ✅ 4 Active Habits Tracked
- ✅ 1.30 STX Currently Staked
- ✅ Full Frontend Integration Complete
- ✅ Security Audited

## ✨ Features

### Core Functionality
- 💰 **Habit Staking** - Minimum 0.1 STX commitment per habit
- ⏰ **Daily Check-ins** - 24-hour window (144 blocks) for accountability
- 🔥 **Streak Tracking** - Visual progress monitoring
- 💸 **Stake Withdrawal** - Reclaim your stake after 7-day completion
- 🎁 **Bonus Pool** - Earn from forfeited stakes of failed habits

### User Experience
- 🔐 **Wallet Integration** - Leather, Xverse, Asigna support
- 📊 **Dashboard Analytics** - Real-time habit statistics
- ⚡ **Transaction Confirmation** - Smart retry and cache invalidation
- 🎨 **Modern UI** - Tailwind CSS responsive design
- 🛡️ **Security** - Post-condition validation for all STX transfers

## 🛠️ Tech Stack

### Smart Contract
- **Language:** Clarity 2.0
- **Network:** Stacks Mainnet
- **Testing:** Vitest 2.1.8 + Clarinet SDK (29/29 tests passing)
- **Security:** Post-condition mode: Deny

### Frontend
- **Framework:** React 18.2.0 + TypeScript 5.9.3
- **Build Tool:** Vite 4.5.14
- **Styling:** Tailwind CSS 3.4.0
- **State:** @tanstack/react-query 5.62.11
- **Blockchain:** @stacks/connect 7.0.0, @stacks/transactions 6.18.0
- **Network:** StacksMainnet

## 🚀 Getting Started

### Prerequisites

```bash
# Required
- Node.js >= 18.x
- npm or pnpm
- Clarinet CLI (for contract development)
- Stacks wallet (Leather, Xverse, or Asigna)
```

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/AhhbitTracker.git
cd AhhbitTracker

# Install dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
```

### Development

```bash
# Terminal 1: Run contract tests
npm test

# Terminal 2: Start frontend dev server
cd frontend
npm run dev
# Opens at http://localhost:3000
```

### Testing

```bash
# Run all contract tests (29 tests)
npm test

# Check contract syntax
clarinet check

# Run specific test file
npm test -- habit-tracker.test.ts
```

### Build for Production

```bash
# Build frontend
cd frontend
npm run build
# Output in frontend/dist/

# Deploy contract (see docs/DEPLOYMENT.md)
clarinet deployments apply -p deployments/default.mainnet-plan.yaml
```

## 📋 Contract Functions

### Public Functions

| Function | Description | Parameters | Returns |
|----------|-------------|------------|---------|
| `create-habit` | Create new habit with stake | `name: string-utf8, stake: uint` | `(response uint uint)` |
| `check-in` | Record daily check-in | `habit-id: uint` | `(response uint uint)` |
| `withdraw-stake` | Withdraw stake after 7-day streak | `habit-id: uint` | `(response uint uint)` |
| `claim-bonus` | Claim bonus from forfeited pool | `habit-id: uint` | `(response uint uint)` |
| `slash-habit` | Forfeit expired habits to pool | `habit-id: uint` | `(response uint uint)` |

### Read-Only Functions

| Function | Description | Returns |
|----------|-------------|---------|
| `get-habit` | Retrieve habit details | `(optional habit-tuple)` |
| `get-user-habits` | Get user's habit list | `(tuple (habit-ids (list uint)))` |
| `get-habit-streak` | Get current streak | `(response uint uint)` |
| `get-pool-balance` | Get forfeited pool balance | `(response uint uint)` |
| `get-total-habits` | Get total habits created | `(response uint uint)` |
| `get-user-stats` | Get user statistics | `(response stats-tuple uint)` |

### Habit Data Structure

```clarity
{
  owner: principal,
  name: (string-utf8 50),
  stake-amount: uint,
  current-streak: uint,
  last-check-in-block: uint,
  created-at-block: uint,
  is-active: bool,
  is-completed: bool
}
```

## 🔐 Security Features

- ✅ **Post-Condition Validation** - All STX transfers validated before execution
- ✅ **Authorization Checks** - Only habit owners can check-in/withdraw
- ✅ **Input Validation** - Name length, stake amount, window timing
- ✅ **Reentrancy Protection** - State changes before external calls
- ✅ **Security Audit** - Comprehensive audit completed (see SECURITY_AUDIT_REPORT.md)
- ✅ **Zero Vulnerabilities** - No private keys or sensitive data in repository

## 📚 Documentation

### Core Documentation
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Smart Contract Design](docs/SMART_CONTRACT_DESIGN.md)
- [Frontend Integration Guide](docs/INTEGRATION_GUIDE.md)
- [API Reference](docs/API_REFERENCE.md)

### Development Guides
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Post-Deployment Checklist](docs/POST_DEPLOYMENT.md)
- [Testing Guide](docs/TESTING_GUIDE.md)
- [Contribution Guide](CONTRIBUTING.md)

### Additional Resources
- [Security Audit Report](SECURITY_AUDIT_REPORT.md)
- [FAQ](docs/FAQ.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [Roadmap](docs/ROADMAP.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📊 Project Status

- **Smart Contract:** ✅ Deployed to Mainnet
- **Frontend:** ✅ Production Ready
- **Testing:** ✅ 29/29 Tests Passing
- **Security:** ✅ Audited
- **Documentation:** ✅ Complete

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built on [Stacks](https://www.stacks.co/) blockchain
- Powered by [Clarity](https://clarity-lang.org/) smart contracts
- UI components inspired by modern web3 design patterns

---

**Made with ❤️ for the Stacks community**


