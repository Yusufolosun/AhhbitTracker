# Testnet Deployment Guide

## Overview

Deploy and test the AhhbitTracker contract on Stacks Testnet before mainnet deployment.

## Prerequisites

- Clarinet CLI installed
- Testnet STX tokens (from faucet)
- Stacks wallet configured for testnet

## Step 1: Get Testnet STX

### Using Stacks Faucet

Visit the Stacks testnet faucet:
```
https://explorer.hiro.so/sandbox/faucet?chain=testnet
```

Request testnet STX for your deployer address. You'll need approximately 2 STX for deployment and testing.

## Step 2: Configure Testnet Settings

Create `settings/Testnet.toml` (already in .gitignore):

```toml
[network]
name = "testnet"

[accounts.deployer]
mnemonic = "YOUR_24_WORD_MNEMONIC_HERE"
balance = 100000000000
```

**Security Note:** Never commit this file or share your mnemonic.

## Step 3: Verify Contract

Before deployment, verify the contract syntax:

```bash
clarinet check
```

Expected output:
```
✓ habit-tracker.clar
```

## Step 4: Run Tests

Ensure all tests pass:

```bash
npm test
```

All 29 tests should pass.

## Step 5: Deploy to Testnet

Execute deployment:

```bash
clarinet deploy --testnet
```

Expected output:
```
Deploying contracts...
✓ habit-tracker deployed
Transaction ID: 0x...
Contract Address: ST...
```

## Step 6: Record Deployment Details

Save the deployment information:

- **Transaction ID:** 0x...
- **Contract Address:** ST...
- **Block Height:** ...
- **Deployer Address:** ST...

## Step 7: Verify on Explorer

Check deployment on Stacks Explorer:

```
https://explorer.hiro.so/txid/[TRANSACTION_ID]?chain=testnet
https://explorer.hiro.so/address/[CONTRACT_ADDRESS]?chain=testnet
```

Verify:
- Transaction confirmed
- Contract source visible
- Contract functions listed

## Step 8: Test Contract Functions

### Using Clarinet Console

```bash
clarinet console --testnet
```

### Test Read-Only Functions

```clarity
;; Check pool balance (should be 0 initially)
(contract-call? 'ST...habit-tracker get-forfeited-pool-balance)

;; Expected: (ok u0)
```

### Test Habit Creation

```clarity
;; Create a test habit
(contract-call? 'ST...habit-tracker create-habit u"Test Habit" u100000)

;; Expected: (ok u1)
```

### Test Check-In

```clarity
;; Check in for habit 1
(contract-call? 'ST...habit-tracker check-in u1)

;; Expected: (ok u1)
```

### Test Get Habit

```clarity
;; Retrieve habit details
(contract-call? 'ST...habit-tracker get-habit u1)

;; Expected: (some {habit-data})
```

## Step 9: Integration Testing

Perform a complete workflow test:

1. **Create habit** with 0.1 STX stake
2. **Check in** daily for 7 consecutive days
3. **Withdraw stake** after completing streak
4. **Verify** STX returned to wallet

## Step 10: Test Forfeiture Mechanism

1. Create another habit
2. Check in once
3. Wait for check-in window to expire (144 blocks)
4. Have another user call `slash-habit`
5. Verify stake moved to forfeited pool

## Troubleshooting

### Deployment Fails

**Issue:** Insufficient balance  
**Solution:** Request more testnet STX from faucet

**Issue:** Network timeout  
**Solution:** Retry deployment, testnet can be slow

### Transaction Not Confirming

**Issue:** Transaction stuck in mempool  
**Solution:** Wait for next block (typically 10 minutes)

### Contract Not Found

**Issue:** Contract not visible on explorer  
**Solution:** Wait for block confirmation, then refresh

## Post-Testnet Checklist

Before proceeding to mainnet:

- [ ] Contract deployed successfully
- [ ] All functions tested and working
- [ ] Habit creation tested
- [ ] Check-in mechanism verified
- [ ] Withdrawal tested
- [ ] Forfeiture tested
- [ ] No critical issues found
- [ ] Gas costs estimated

## Gas Cost Estimates

Based on testnet deployment:

- **Deployment:** ~0.5-1.0 STX
- **create-habit:** ~0.15-0.25 STX
- **check-in:** ~0.10-0.20 STX
- **withdraw-stake:** ~0.15-0.25 STX
- **claim-bonus:** ~0.15-0.25 STX

## Next Steps

After successful testnet deployment and testing:

1. Review test results
2. Document any issues found
3. Make necessary contract adjustments
4. Redeploy to testnet if changes made
5. Proceed to mainnet deployment

## Mainnet Preparation

Once testnet is confirmed working:

- Update `settings/Mainnet.toml` with production mnemonic
- Fund mainnet deployer wallet with real STX
- Follow [Mainnet Deployment Guide](DEPLOYMENT.md)
