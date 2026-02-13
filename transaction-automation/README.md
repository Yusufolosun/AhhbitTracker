# AhhbitTracker Transaction Automation

Production-ready transaction automation system for the AhhbitTracker habit tracking contract on Stacks mainnet.

## 🎯 Overview

This system automates bulk transaction execution for the **habit-tracker** contract deployed at:
- **Contract:** `SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker`
- **Network:** Stacks Mainnet

## ✨ Features

✅ **Multi-function Support**
- `create-habit` - Create new tracking habits with stakes
- `check-in` - Record habit completion check-ins
- `withdraw-stake` - Withdraw stakes from completed habits
- `claim-bonus` - Claim bonus rewards

✅ **Production Ready**
- Automatic fee estimation with configurable multiplier
- Retry logic for failed broadcasts (3 attempts by default)
- Comprehensive transaction logging
- Dry-run mode for safe testing
- Balance validation before execution

✅ **Cross-Platform**
- Windows, Mac, and Linux compatible
- Uses `cross-env` for environment variable handling

✅ **Wallet Support**
- Private key import (recommended)
- Mnemonic phrase support (12 or 24 words)

## 📦 Installation

### 1. Install dependencies

```bash
cd transaction-automation
npm install
```

### 2. Configure environment

```bash
# Copy the example configuration
cp .env.example .env

# Edit .env with your credentials
nano .env  # or use your preferred editor
```

### 3. Configure your wallet

**For address `SPJJV79C95XD37H9Q91V4RZX9CBAM1G3ZAXAEWWY`:**

1. Open your Leather wallet
2. Select the account with this address
3. Export the private key (64-character hex string)
4. Add it to `.env`:

```bash
PRIVATE_KEY=your_64_character_hex_private_key_here
```

## ⚙️ Configuration

Edit `.env` to customize your automation:

### Essential Settings

```bash
# Wallet (use private key from Leather)
PRIVATE_KEY=your_private_key_here

# Function to execute
FUNCTION_NAME=create-habit

# Transaction settings
TOTAL_TRANSACTIONS=40
MAX_BUDGET_STX=2.5
DELAY_BETWEEN_TX=5
```

### Function-Specific Parameters

#### For `create-habit`:
```bash
FUNCTION_NAME=create-habit
HABIT_NAME=Daily Exercise #{number}
STAKE_AMOUNT=100000  # 0.1 STX in microSTX
```

#### For `check-in`, `withdraw-stake`, or `claim-bonus`:
```bash
FUNCTION_NAME=check-in
HABIT_IDS=1,2,3,4,5,6,7,8,9,10  # Comma-separated habit IDs
```

## 🚀 Usage

### Step 1: Test with Dry Run (MANDATORY)

Always test first without broadcasting transactions:

```bash
npm run dry-run
```

**Expected output:**
```
✅ Configuration loaded successfully
📊 Mode: DRY RUN (no transactions will be broadcast)
🎯 Target: SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker
📝 Function: create-habit
🔢 Transactions: 40
💰 Max fee budget: 2.5 STX

[1/40] CREATE-HABIT
   Habit "Daily Exercise 1" with 0.1000 STX stake
   ✅ DRY RUN: Transaction built successfully
   💰 Fee: 0.062500 STX
   📊 Progress: 1 successful, 0 failed

...

✅ Successful: 40
❌ Failed: 0
```

### Step 2: Execute Live Transactions

After successful dry-run:

```bash
npm start
```

The system will:
1. Validate your wallet and balance
2. Show a 5-second final warning
3. Execute all transactions with delays
4. Save detailed logs to `logs/transactions-*.json`

## 💰 Balance Requirements

### For `create-habit`:
- **Fees:** ~2.5 STX (40 transactions × 0.0625 STX)
- **Stakes:** ~4.0 STX (40 habits × 0.1 STX)
- **Total Required:** ~6.5 STX

### For `check-in`, `withdraw-stake`, `claim-bonus`:
- **Fees:** ~2.5 STX (40 transactions × 0.0625 STX)
- **Total Required:** ~2.5 STX

**Current wallet balance:** 0.96 STX ➡️ **Fund with additional STX before running**

## 📊 Transaction Logs

All executions are logged to `logs/` directory:

```json
{
  "summary": {
    "total": 40,
    "successful": 40,
    "failed": 0,
    "totalTimeSeconds": 213.45,
    "mode": "live",
    "network": "mainnet",
    "functionName": "create-habit",
    "senderAddress": "SPJJV79C95XD37H9Q91V4RZX9CBAM1G3ZAXAEWWY"
  },
  "transactions": [
    {
      "index": 1,
      "txId": "0x...",
      "function": "create-habit",
      "details": "Habit \"Daily Exercise 1\" with 0.1000 STX stake",
      "fee": "0.062500",
      "status": "broadcasted",
      "explorerLink": "https://explorer.hiro.so/txid/0x...?chain=mainnet"
    }
  ]
}
```

## 🔧 Common Patterns

### Pattern 1: Create 10 new habits
```bash
# .env
FUNCTION_NAME=create-habit
TOTAL_TRANSACTIONS=10
HABIT_NAME=Morning Routine #{number}
STAKE_AMOUNT=100000
```

### Pattern 2: Check-in for habits 1-20
```bash
# .env
FUNCTION_NAME=check-in
TOTAL_TRANSACTIONS=20
HABIT_IDS=1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20
```

### Pattern 3: Withdraw stakes from habits 1-5
```bash
# .env
FUNCTION_NAME=withdraw-stake
TOTAL_TRANSACTIONS=5
HABIT_IDS=1,2,3,4,5
```

### Pattern 4: Mixed 40-transaction automation
Run in sequence:
1. `create-habit` × 10
2. `check-in` × 20
3. `withdraw-stake` × 5
4. `claim-bonus` × 5

## 🐛 Troubleshooting

### "DRY_RUN is not recognized" (Windows)
✅ Fixed automatically by `cross-env` package

### "Insufficient balance"
Fund your wallet with required STX amount shown in error message

### "No habit ID available"
Check `HABIT_IDS` in `.env` has enough comma-separated IDs

### Transaction broadcast failed
- Check network connectivity
- Verify contract address and function name
- Ensure wallet has sufficient balance
- Review error in saved transaction log

## 🔒 Security

- ✅ `.env` is git-ignored (never committed)
- ✅ Private keys stored securely in `.env`
- ✅ Use separate wallet (not contract deployer)
- ✅ Test with dry-run before live execution
- ✅ Transaction logs saved for auditing

## 📚 Resources

- **Contract:** [SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker](https://explorer.hiro.so/txid/SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker?chain=mainnet)
- **Explorer:** https://explorer.hiro.so
- **Stacks Docs:** https://docs.stacks.co
- **@stacks/transactions:** https://github.com/hirosystems/stacks.js

## 📝 License

MIT
