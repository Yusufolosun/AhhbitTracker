# 40 Transaction Executor

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Fund Wallet

- Create new Stacks wallet OR use existing
- Send 3 STX to wallet address
- **Do NOT use deployer wallet**

### 3. Run Script

```bash
npx ts-node scripts/execute-40-transactions.ts
```

### 4. Follow Prompts

- Enter your private key (64-char hex)
- Type "EXECUTE" to confirm
- Wait ~80 minutes for completion

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
