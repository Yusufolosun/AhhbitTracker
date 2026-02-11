# Running Transaction Tests

## Quick Start

### 1. Setup

```bash
# Install dependencies
npm install

# TEST FIRST - Dry run validation (no real transactions)
npm run dry-run
```

### 2. Fund Wallet

Send 3 STX to your test wallet address.

**Wallet Input:**
- You can use your **24-word mnemonic seed phrase** (recommended)
- OR your **64-character hexadecimal private key**
- Scripts will auto-detect which format you provide

**Important:**
- Use a **different wallet** than the contract deployer
- Need minimum 3 STX (2.5 for fees + 0.5 buffer)
- Get your wallet's private key (64-char hex format)

### 3. Execute

```bash
# First: Test with dry run
npm run dry-run

# Then: Execute real transactions
npm run tx:40
```

### 4. Follow Prompts

1. Enter your private key when prompted
2. Confirm wallet balance is sufficient
3. Review transaction plan
4. Type "EXECUTE" to begin
5. Wait ~80 minutes for completion

## Important Notes

⚠️ **Run dry-run first to validate setup**  
⚠️ **Use a different wallet than the deployer**  
⚠️ **Transactions are real and irreversible**  
⚠️ **Budget is 2.5 STX total for 40 transactions**  
⚠️ **Execution takes ~80 minutes**  
⚠️ **Private key is never stored in files**

## What Gets Created

- 10 test habits (0.1 STX stake each)
- 20 check-ins across habits
- 5 withdrawal attempts (expected to fail)
- 5 bonus claim attempts (expected to fail)

## Results

After completion:
- Check [scripts/transaction-results.json](scripts/transaction-results.json)
- View transactions on Stacks Explorer
- Verify contract state updated

## Full Documentation

- [Quick README](scripts/README-TRANSACTIONS.md) - Basic usage
- [Setup Guide](scripts/TRANSACTION_SETUP.md) - Detailed instructions
- [Example Output](scripts/EXAMPLE-OUTPUT.md) - What to expect

## Contract Information

- **Address**: `SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker`
- **Network**: Stacks Mainnet
- **Functions Tested**: create-habit, check-in, withdraw-stake, claim-bonus

## Troubleshooting

**"Invalid input" error:**
- Ensure you're using either:
  - 24-word mnemonic: `word1 word2 word3 ... word24`
  - 64-char private key: `abc123def456...` (no spaces)
- Remove any extra spaces or newlines

**Insufficient balance error:****
- Ensure wallet has at least 3 STX
- Check balance on Stacks Explorer

**Invalid private key:**
- Must be 64 hexadecimal characters
- Remove any "0x" prefix
- Use mainnet wallet (not testnet)

**Transaction failures:**
- Some failures are expected (withdraw without streak, claim from empty pool)
- Check error messages in transaction-results.json
- View transaction details on Explorer

## Security

✅ Private key entered interactively (never stored)
✅ All sensitive files in .gitignore
✅ Separate test wallet recommended
✅ Complete transaction logging for audit

## Support

For detailed setup, see [scripts/TRANSACTION_SETUP.md](scripts/TRANSACTION_SETUP.md)
