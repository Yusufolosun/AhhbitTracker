# Deployment Guide

## Prerequisites

- Clarinet CLI installed
- STX wallet with sufficient balance
- Mainnet RPC access

## Deployment Steps

### 1. Verify Contract

```bash
clarinet check
```

### 2. Run Tests

```bash
npm test
```

### 3. Deploy to Mainnet

```bash
clarinet deploy --mainnet
```

### 4. Verify Deployment

Check transaction on Stacks Explorer:
```
https://explorer.hiro.so/txid/[TRANSACTION_ID]?chain=mainnet
```

### 5. Update Contract Address

After deployment, update the contract address in:
- `scripts/interact.ts`
- Frontend configuration

## Post-Deployment

### Verify Functions

Test each function via Clarinet console:

```clarity
(contract-call? .habit-tracker get-forfeited-pool-balance)
```

### Monitor Transactions

Track contract usage:
```
https://explorer.hiro.so/address/[CONTRACT_ADDRESS]?chain=mainnet
```

## Mainnet Configuration

Network: Stacks Mainnet
API: https://api.mainnet.hiro.so

## Security Checklist

- [ ] All tests passing
- [ ] Contract syntax verified
- [ ] No private keys in repository
- [ ] Environment variables configured
- [ ] Deployment transaction confirmed
- [ ] Contract functions tested on mainnet

## Estimated Deployment Cost

Contract deployment: ~0.5-1.0 STX
Transaction fee: ~0.1 STX
Total: ~0.6-1.1 STX

## Troubleshooting

### Deployment Fails

Check:
- Wallet balance sufficient
- Network connectivity
- Contract syntax valid

### Transaction Stuck

- Check mempool status
- Verify transaction ID
- Wait for block confirmation
