# 🚀 AhhbitTracker Transaction Automation - Quick Start

## ✅ Setup Complete!

Your production-ready transaction automation system is ready to use.

## 📍 Location

All automation files are in: **`transaction-automation/`**

## ⚡ Quick Start (3 Steps)

### 1. Export Your Private Key from Leather

1. Open Leather wallet
2. Select account: **SPJJV79C95XD37H9Q91V4RZX9CBAM1G3ZAXAEWWY**
3. Export private key (64-character hex string)

### 2. Configure `.env`

```bash
cd transaction-automation
nano .env  # Edit and add your private key
```

Replace `placeholder_add_your_private_key_here_64_hex_characters` with your actual private key.

### 3. Test & Execute

```bash
# Test first (no transactions broadcast)
npm run dry-run

# If successful, execute live
npm start
```

## 💰 Balance Required

Your wallet (`SPJJV79C95XD37H9Q91V4RZX9CBAM1G3ZAXAEWWY`) currently has **0.96 STX**.

### For create-habit (current configuration):
- **Fees:** ~2.5 STX
- **Stakes:** ~4.0 STX (40 × 0.1 STX)
- **Total needed:** ~6.5 STX
- **⚠️ Fund with ~5.54 more STX**

### For check-in/withdraw/claim:
- **Fees:** ~2.5 STX only
- **Total needed:** ~2.5 STX
- **⚠️ Fund with ~1.54 more STX**

## 📖 Full Documentation

See **`transaction-automation/README.md`** for:
- Complete configuration guide
- All supported functions
- Transaction patterns
- Troubleshooting

## 🎯 Supported Functions

| Function | Description | Parameters |
|----------|-------------|------------|
| `create-habit` | Create new habits with stakes | `HABIT_NAME`, `STAKE_AMOUNT` |
| `check-in` | Record completion check-ins | `HABIT_IDS` |
| `withdraw-stake` | Withdraw stakes | `HABIT_IDS` |
| `claim-bonus` | Claim bonus rewards | `HABIT_IDS` |

## 🔒 Security Notes

- ✅ `.env` is git-ignored (safe)
- ✅ Never share your private key
- ✅ Use separate wallet for automation
- ✅ Always run dry-run first

## 📊 Example Execution Flow

### Option 1: Create 10 habits, test 20 check-ins, withdraw 5, claim 5

Run 4 separate executions:

```bash
# 1. Create 10 habits
# Edit .env: FUNCTION_NAME=create-habit, TOTAL_TRANSACTIONS=10
npm start

# 2. Check-in 20 times
# Edit .env: FUNCTION_NAME=check-in, TOTAL_TRANSACTIONS=20, HABIT_IDS=1,2,3...
npm start

# 3. Withdraw 5 stakes
# Edit .env: FUNCTION_NAME=withdraw-stake, TOTAL_TRANSACTIONS=5, HABIT_IDS=1,2,3,4,5
npm start

# 4. Claim 5 bonuses
# Edit .env: FUNCTION_NAME=claim-bonus, TOTAL_TRANSACTIONS=5, HABIT_IDS=1,2,3,4,5
npm start
```

### Option 2: Simple 40 create-habit execution

Current default configuration is already set for this:

```bash
npm run dry-run  # Test
npm start        # Execute
```

## 📦 Transaction Logs

All executions are saved to `transaction-automation/logs/` with:
- Transaction IDs
- Explorer links
- Success/failure status
- Timestamps
- Full execution summary

## 🆘 Need Help?

1. Check `transaction-automation/README.md`
2. Review error messages in terminal
3. Check transaction logs in `logs/`
4. Verify balance and configuration in `.env`

---

**Ready to start!** Fund your wallet and run `npm run dry-run` in the `transaction-automation` folder.
