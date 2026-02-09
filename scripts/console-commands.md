# Clarinet Console Commands for Mainnet Testing

## Setup

```bash
clarinet console --mainnet
```

## Transaction 1: Create First Habit

```clarity
(contract-call? 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker 
  create-habit 
  u"Morning Exercise" 
  u100000)
```

## Transaction 2: Create Second Habit

```clarity
(contract-call? 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker 
  create-habit 
  u"Daily Reading" 
  u1000000)
```

## Transaction 3: First Check-in

```clarity
(contract-call? 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker 
  check-in 
  u1)
```

## Read-Only Query 4: Get Habit

```clarity
(contract-call? 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker 
  get-habit 
  u1)
```

## Read-Only Query 5: Get User Habits

```clarity
(contract-call? 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker 
  get-user-habits 
  'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193)
```

## Read-Only Query 6: Get Pool Balance

```clarity
(contract-call? 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker 
  get-pool-balance)
```

## Read-Only Query 7: Get User Stats

```clarity
(contract-call? 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker 
  get-user-stats 
  'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193)
```

## Transaction 8: Second Check-in (After 144 blocks)

```clarity
(contract-call? 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker 
  check-in 
  u1)
```

## Verification Commands

### Check Current Block Height

```clarity
block-height
```

### Check Contract Balance

```clarity
(stx-get-balance 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker)
```

### Check User Balance

```clarity
(stx-get-balance tx-sender)
```
