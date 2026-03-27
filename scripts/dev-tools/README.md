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
ts-node scripts/dev-tools/test-function.ts get-pool-balance
```

### Nonce Checker
Get current nonce for address:
```bash
ts-node scripts/dev-tools/get-nonce.ts SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z
```

### Balance Checker
Check STX balance:
```bash
ts-node scripts/dev-tools/check-balance.ts SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z
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
