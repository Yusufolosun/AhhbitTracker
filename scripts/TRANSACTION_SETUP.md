# Transaction Executor Setup Guide

## Prerequisites

1. **Node.js and Dependencies**
```bash
npm install
```

Required packages:
- `@stacks/transactions`
- `@stacks/network`

2. **Funded Wallet**
   - Create new Stacks wallet OR use existing non-deployer wallet
   - Fund with at least 3 STX (2.5 STX budget + 0.5 buffer)
   - **DO NOT use deployer wallet for testing**

3. **Wallet Credentials**
   - 64-character hexadecimal private key
   - Wallet must be different from contract deployer

---

## Setup Steps

### Step 1: Verify Dependencies

```bash
npm install @stacks/transactions @stacks/network
```

### Step 2: Fund Your Wallet

Send at least 3 STX to your test wallet address.

**Why 3 STX?**
- 2.5 STX for transaction fees (budget)
- 0.5 STX buffer for safety
- Note: Stakes (0.1 STX each) are included in transactions but returned on completion

### Step 3: Prepare Private Key

You'll need your wallet's private key in hexadecimal format (64 characters).

⚠️ **SECURITY NOTE**: The script prompts for your key at runtime and NEVER stores it in files.

---

## Execution

### Run the Script

```bash
npx ts-node scripts/execute-40-transactions.ts
```

**What happens:**
1. Prompts for your private key
2. Validates wallet balance (must have 3+ STX)
3. Shows transaction plan
4. Asks for confirmation ("EXECUTE")
5. Executes 40 transactions with 2-minute delays
6. Saves results to `transaction-results.json`

**Total Time:** ~80 minutes (40 tx × 2 min delay)

---

## Transaction Distribution

The script executes:

| Function | Count | Purpose |
|----------|-------|---------|
| create-habit | 10 | Create test habits with 0.1 STX stakes |
| check-in | 20 | Check in on created habits |
| withdraw-stake | 5 | Attempt withdrawals (will fail if streak < 7) |
| claim-bonus | 5 | Attempt bonus claims (will fail if pool empty) |
| **Total** | **40** | |

---

## Expected Results

### Successful Transactions

- `create-habit`: All 10 should succeed
- `check-in`: Most should succeed (may fail if too frequent)
- `withdraw-stake`: Will fail unless 7-day streak completed
- `claim-bonus`: Will fail if no pool balance

### Expected Success Rate

- **Realistic**: 60-70% (24-28 successful transactions)
- **Optimistic**: 75-80% (30-32 successful transactions)

Some failures are expected and normal (insufficient streak, empty pool, etc.)

---

## Monitoring Progress

### During Execution

Watch console output:
```
[1/40] Create Habit...
   ✅ Submitted: 0xabc123...
   📎 https://explorer.hiro.so/txid/0xabc123...?chain=mainnet
   ⏳ Waiting 120 seconds...

[2/40] Create Habit...
   ✅ Submitted: 0xdef456...
   📎 https://explorer.hiro.so/txid/0xdef456...?chain=mainnet
```

### After Completion

Check transaction history:
```bash
cat scripts/transaction-results.json
```

View on Explorer:
```
https://explorer.hiro.so/txid/[TRANSACTION_ID]?chain=mainnet
```

---

## Troubleshooting

### "Invalid private key length"

**Problem:** Private key is not 64 hexadecimal characters

**Solution:**
1. Verify you're using the private key (not seed phrase)
2. Remove any "0x" prefix
3. Ensure exactly 64 characters

### "Insufficient balance"

**Problem:** Wallet has less than 3 STX

**Solution:**
1. Check wallet balance on Stacks Explorer
2. Send more STX to wallet
3. Wait for confirmation, then retry

### "Failed to fetch balance"

**Problem:** Network connection issue or wrong address

**Solution:**
1. Check internet connection
2. Verify Stacks API is accessible
3. Try again in a few minutes

### Transactions Failing During Execution

**Problem:** Contract reverts (e.g., insufficient streak)

**Solution:**
- Expected behavior for some functions (withdraw-stake, claim-bonus)
- Check error message in transaction-results.json
- View transaction on Explorer for details

---

## Safety Features

✅ **Interactive key prompt** (not stored in files)
✅ **Balance check** before starting
✅ **User confirmation** required
✅ **Fee budget enforcement** (won't exceed 2.5 STX)
✅ **Error handling** (continues on individual failures)
✅ **Transaction logging** (saves history for review)
✅ **Secure credential handling** (no files committed)

---

## Post-Execution

### Review Results

```bash
# View results file
cat scripts/transaction-results.json

# Count successes (if you have jq installed)
cat scripts/transaction-results.json | jq '[.[] | select(.status == "submitted")] | length'

# Calculate total cost
cat scripts/transaction-results.json | jq '[.[] | .fee] | add / 1000000'
```

### Verify on Chain

Check contract state using Stacks Explorer or Clarinet:

```bash
# View your account's habits
# Visit Explorer and search for your wallet address
# View contract calls made by your address
```

---

## Cleanup

After testing, you can:

1. **Keep transaction history** (for reference/analysis)
2. **Delete test habits** (manually or via future cleanup script)
3. **Archive results** (move transaction-results.json to safe location)

**Remember:** `transaction-results.json` is gitignored and won't be committed.

---

## Advanced Usage

### Custom Transaction Mix

Edit the `plan` array in [execute-40-transactions.ts](execute-40-transactions.ts):

```typescript
const plan = [
  ...Array(15).fill({ fn: 'create-habit', label: 'Create Habit' }),  // More habits
  ...Array(25).fill({ fn: 'check-in', label: 'Check In' }),          // More check-ins
  // Adjust as needed
];
```

### Different Budget

Modify constants at top of script:

```typescript
const TOTAL_TRANSACTIONS = 80;  // More transactions
const TOTAL_BUDGET_STX = 5.0;   // Higher budget
```

### Faster Execution

**⚠️ Not recommended** (may cause nonce conflicts):

```typescript
const DELAY_BETWEEN_TX_MS = 30000;  // 30 seconds instead of 120
```

---

## Support

If you encounter issues:

1. Check wallet has sufficient balance (3+ STX)
2. Verify contract address is correct
3. Review transaction history for error patterns
4. Check Stacks network status: https://status.hiro.so
5. Ensure you're using a mainnet wallet (not testnet)

---

## Security Best Practices

⚠️ **NEVER commit your private key**
⚠️ **Use a dedicated test wallet** (not your main wallet)
⚠️ **Verify contract address** before execution
⚠️ **Start with small budget** to test
⚠️ **Review transaction plan** carefully
⚠️ **Keep transaction logs** for auditing

---

## Contract Information

- **Contract**: `SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker`
- **Network**: Stacks Mainnet
- **Deployment Date**: February 9, 2026
- **Functions**: create-habit, check-in, withdraw-stake, claim-bonus

---

## Next Steps

After successful execution:

1. ✅ Review transaction-results.json
2. ✅ Verify transactions on Stacks Explorer
3. ✅ Check contract state updated correctly
4. ✅ Document any issues encountered
5. ✅ Keep results for project records
