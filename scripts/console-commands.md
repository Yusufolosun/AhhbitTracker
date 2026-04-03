# Clarinet Console Commands for Mainnet Testing

Quick reference for interacting with the deployed AhhbitTracker contract via Clarinet console.

## Setup

```bash
clarinet console --mainnet
```

## Creating Habits

### Transaction 1: Create First Habit

```clarity
(contract-call? 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z.habit-tracker-v2 
  create-habit 
  u"Morning Exercise" 
  u100000)
```

### Transaction 2: Create Second Habit

```clarity
(contract-call? 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z.habit-tracker-v2 
  create-habit 
  u"Daily Reading" 
  u1000000)
```

## Check-ins

### Transaction 3: First Check-in

```clarity
(contract-call? 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z.habit-tracker-v2 
  check-in 
  u1)
```

### Transaction 8: Second Check-in (After 144 blocks)

```clarity
(contract-call? 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z.habit-tracker-v2 
  check-in 
  u1)
```

> **Note:** Check-ins require at least 144 blocks (~24 hours) between them.

## Read-Only Queries

### Query: Get Habit

```clarity
(contract-call? 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z.habit-tracker-v2 
  get-habit 
  u1)
```

### Query: Get User Habits

```clarity
(contract-call? 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z.habit-tracker-v2 
  get-user-habits 
  'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z)
```

### Query: Get Pool Balance

```clarity
(contract-call? 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z.habit-tracker-v2 
  get-pool-balance)
```

### Query: Get User Stats

```clarity
(contract-call? 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z.habit-tracker-v2 
  get-user-stats 
  'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z)
```

## Verification Commands

### Check Current Block Height

```clarity
block-height
```

### Check Contract Balance

```clarity
(stx-get-balance 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z.habit-tracker-v2)
```

### Check User Balance

```clarity
(stx-get-balance tx-sender)
```

## Expected Responses

| Function | Success Response |
|----------|-----------------|
| `create-habit` | `(ok <habit-id>)` |
| `check-in` | `(ok true)` |
| `get-habit` | `(some { ... })` |
| `get-pool-balance` | `u<amount>` |
