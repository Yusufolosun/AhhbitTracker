# 40 Transaction Executor

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Test Configuration (Dry Run)

```bash
npm run dry-run
```

This validates your setup without executing real transactions.

### 3. Fund Wallet

- Create new Stacks wallet OR use existing
- Send 3 STX to wallet address
- **Do NOT use deployer wallet**

### 4. Run Script

```bash
npm run tx:40
```

### 5. Follow Prompts

- Enter your private key (64-char hex)
- Type "EXECUTE" to confirm
- Wait ~80 minutes for completion

## Dry Run Testing

**Always test first before executing real transactions:**

```bash
npm run dry-run
```

The dry run will:
- ✅ Validate your private key format
- ✅ Check wallet balance (real or simulated)
- ✅ Verify all transaction parameters
- ✅ Calculate exact costs
- ✅ Estimate execution time
- ✅ Confirm you're ready to execute

**No real transactions are executed in dry-run mode!**

## What Happens

The script executes 40 transactions:

| Function | Count | Notes |
|----------|-------|-------|
| create-habit | 10 | Creates test habits (0.1 STX each) |
| check-in | 20 | Checks in on created habits |
| withdraw-stake | 5 | Attempts withdrawal (may fail) |
| claim-bonus | 5 | Attempts bonus claim (may fail) |

## Results

After completion:
- Check `scripts/transaction-results.json`
- View transactions on Stacks Explorer
- Total cost: ~2.5 STX

## Security

⚠️ **Never commit your private key**
⚠️ **Use a separate wallet for testing**
⚠️ **Transactions are irreversible**

## Support

If transactions fail:
1. Check wallet balance (need 3+ STX)
2. Verify contract address is correct
3. Review errors in transaction-results.json
