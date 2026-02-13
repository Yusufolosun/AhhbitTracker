# Developer Tools

Utilities for contract development and debugging.

## Tools

### Contract Inspector
View contract source and interface:
```bash
ts-node scripts/dev-tools/inspect-contract.ts
```

### Function Tester
Test read-only functions:
```bash
ts-node scripts/dev-tools/test-function.ts get-habit 1
ts-node scripts/dev-tools/test-function.ts get-forfeited-pool-balance
```

### Nonce Checker
Get current nonce for address:
```bash
ts-node scripts/dev-tools/get-nonce.ts SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193
```

### Balance Checker
Check STX balance:
```bash
ts-node scripts/dev-tools/check-balance.ts SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193
```

### Transaction Tracker
Monitor transaction status:
```bash
ts-node scripts/dev-tools/track-transaction.ts 0xabc123...
```

## Use Cases

- Debugging contract interactions
- Monitoring transaction status
- Checking account state
- Testing functions before deployment
