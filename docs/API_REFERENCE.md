# API Reference

Complete reference for all contract functions and data structures.

## Contract Information

**Address:** `SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker`  
**Network:** Stacks Mainnet  
**Language:** Clarity v2  
**Epoch:** 2.5

---

## Public Functions

### create-habit

Creates a new habit with stake commitment.

**Signature:**
```clarity
(define-public (create-habit (name (string-utf8 50)) (stake-amount uint)))
```

**Parameters:**
- `name` (string-utf8 50): Habit description
- `stake-amount` (uint): Amount to stake in microSTX

**Returns:**
- Success: `(ok uint)` - The habit ID
- Error: See error codes below

**Errors:**
- `u101` - ERR-INVALID-STAKE-AMOUNT (stake below minimum)
- `u102` - ERR-INVALID-HABIT-NAME (invalid name format)
- `u110` - ERR-TRANSFER-FAILED (STX transfer error)

**Example:**
```clarity
(contract-call? '.habit-tracker create-habit u"Morning Run" u500000)
;; Returns: (ok u1)
```

**Gas Cost:** ~122,000 microSTX

---

### check-in

Records a daily check-in for a habit.

**Signature:**
```clarity
(define-public (check-in (habit-id uint)))
```

**Parameters:**
- `habit-id` (uint): ID of the habit to check in for

**Returns:**
- Success: `(ok uint)` - Updated streak count
- Error: See error codes below

**Errors:**
- `u103` - ERR-HABIT-NOT-FOUND
- `u104` - ERR-NOT-HABIT-OWNER
- `u105` - ERR-ALREADY-CHECKED-IN
- `u106` - ERR-CHECK-IN-WINDOW-EXPIRED
- `u108` - ERR-HABIT-ALREADY-COMPLETED

**Example:**
```clarity
(contract-call? '.habit-tracker check-in u1)
;; Returns: (ok u5) - Streak is now 5
```

**Requirements:**
- Caller must be habit owner
- Habit must be active
- Must not have checked in within last 14 blocks
- Must check in within 144 blocks of last check-in

**Gas Cost:** ~50,000 microSTX

---

### withdraw-stake

Withdraws stake after completing minimum streak.

**Signature:**
```clarity
(define-public (withdraw-stake (habit-id uint)))
```

**Parameters:**
- `habit-id` (uint): ID of the habit

**Returns:**
- Success: `(ok uint)` - Amount withdrawn in microSTX
- Error: See error codes below

**Errors:**
- `u103` - ERR-HABIT-NOT-FOUND
- `u104` - ERR-NOT-HABIT-OWNER
- `u107` - ERR-INSUFFICIENT-STREAK (need 7+ days)
- `u108` - ERR-HABIT-ALREADY-COMPLETED
- `u110` - ERR-TRANSFER-FAILED

**Example:**
```clarity
(contract-call? '.habit-tracker withdraw-stake u1)
;; Returns: (ok u500000) - 0.5 STX returned
```

**Requirements:**
- Caller must be habit owner
- Streak must be ≥ 7
- Habit must be active

**Gas Cost:** ~75,000 microSTX

---

### claim-bonus

Claims bonus from forfeited pool.

**Signature:**
```clarity
(define-public (claim-bonus (habit-id uint)))
```

**Parameters:**
- `habit-id` (uint): A completed habit ID for eligibility verification

**Returns:**
- Success: `(ok uint)` - Bonus amount claimed
- Error: See error codes below

**Errors:**
- `u103` - ERR-HABIT-NOT-FOUND
- `u104` - ERR-NOT-HABIT-OWNER
- `u108` - ERR-HABIT-ALREADY-COMPLETED (must be completed to claim)
- `u109` - ERR-POOL-INSUFFICIENT-BALANCE
- `u110` - ERR-TRANSFER-FAILED

**Example:**
```clarity
(contract-call? '.habit-tracker claim-bonus u1)
;; Returns: (ok u250000) - Claimed 0.25 STX bonus
```

**Requirements:**
- Caller must own the habit
- Habit must be completed (withdrawn)
- Pool must have balance

**Gas Cost:** ~60,000 microSTX

---

## Read-Only Functions

### get-habit

Retrieves habit details by ID.

**Signature:**
```clarity
(define-read-only (get-habit (habit-id uint)))
```

**Parameters:**
- `habit-id` (uint): The habit ID

**Returns:**
- Success: `(some {...})` - Habit data tuple
- Not found: `none`

**Response Structure:**
```clarity
{
  owner: principal,
  name: (string-utf8 50),
  stake-amount: uint,
  current-streak: uint,
  last-check-in-block: uint,
  created-at-block: uint,
  is-active: bool,
  is-completed: bool
}
```

**Example:**
```clarity
(contract-call? '.habit-tracker get-habit u1)
;; Returns habit data or none
```

**Gas Cost:** Free (read-only)

---

### get-user-habits

Gets all habit IDs for a user.

**Signature:**
```clarity
(define-read-only (get-user-habits (user principal)))
```

**Parameters:**
- `user` (principal): User's address

**Returns:**
- Success: `(some {habit-ids: (list ...)})` 
- Not found: `none`

**Example:**
```clarity
(contract-call? '.habit-tracker get-user-habits 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193)
;; Returns: (some {habit-ids: (list u1 u2 u3)})
```

**Gas Cost:** Free (read-only)

---

### get-habit-streak

Gets current streak for a habit.

**Signature:**
```clarity
(define-read-only (get-habit-streak (habit-id uint)))
```

**Parameters:**
- `habit-id` (uint): The habit ID

**Returns:**
- Success: `(ok uint)` - Streak count
- Error: `(err u103)` - Habit not found

**Example:**
```clarity
(contract-call? '.habit-tracker get-habit-streak u1)
;; Returns: (ok u7)
```

**Gas Cost:** Free (read-only)

---

### get-forfeited-pool-balance

Gets total balance in forfeited pool.

**Signature:**
```clarity
(define-read-only (get-forfeited-pool-balance))
```

**Parameters:** None

**Returns:**
- `(ok uint)` - Pool balance in microSTX

**Example:**
```clarity
(contract-call? '.habit-tracker get-forfeited-pool-balance)
;; Returns: (ok u2500000) - Pool has 2.5 STX
```

**Gas Cost:** Free (read-only)

---

### get-user-stats

Gets aggregated statistics for a user.

**Signature:**
```clarity
(define-read-only (get-user-stats (user principal)))
```

**Parameters:**
- `user` (principal): User's address

**Returns:**
```clarity
(ok {
  total-habits: uint,
  habit-ids: (list uint)
})
```

**Example:**
```clarity
(contract-call? '.habit-tracker get-user-stats 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193)
;; Returns: (ok {total-habits: u3, habit-ids: (list u1 u2 u3)})
```

**Gas Cost:** Free (read-only)

---

## Constants

### MIN-STAKE-AMOUNT
**Value:** `u100000` (0.1 STX in microSTX)  
**Description:** Minimum stake required to create a habit

### MAX-HABIT-NAME-LENGTH
**Value:** `u50`  
**Description:** Maximum characters in habit name

### CHECK-IN-WINDOW
**Value:** `u144` (blocks)  
**Description:** Maximum blocks between check-ins (~24 hours)

### MIN-STREAK-FOR-WITHDRAWAL
**Value:** `u7`  
**Description:** Minimum consecutive check-ins required for withdrawal

---

## Error Codes

| Code | Constant | Description |
|------|----------|-------------|
| 100 | ERR-NOT-AUTHORIZED | Caller lacks permission |
| 101 | ERR-INVALID-STAKE-AMOUNT | Stake below minimum |
| 102 | ERR-INVALID-HABIT-NAME | Name too long or empty |
| 103 | ERR-HABIT-NOT-FOUND | Habit ID doesn't exist |
| 104 | ERR-NOT-HABIT-OWNER | Caller doesn't own habit |
| 105 | ERR-ALREADY-CHECKED-IN | Already checked in today |
| 106 | ERR-CHECK-IN-WINDOW-EXPIRED | Missed 24hr window |
| 107 | ERR-INSUFFICIENT-STREAK | Streak too short to withdraw |
| 108 | ERR-HABIT-ALREADY-COMPLETED | Habit marked complete |
| 109 | ERR-POOL-INSUFFICIENT-BALANCE | Pool lacks funds |
| 110 | ERR-TRANSFER-FAILED | STX transfer error |

---

## Data Structures

### habits Map

**Key:**
```clarity
{ habit-id: uint }
```

**Value:**
```clarity
{
  owner: principal,
  name: (string-utf8 50),
  stake-amount: uint,
  current-streak: uint,
  last-check-in-block: uint,
  created-at-block: uint,
  is-active: bool,
  is-completed: bool
}
```

### user-habits Map

**Key:**
```clarity
{ user: principal }
```

**Value:**
```clarity
{ habit-ids: (list 100 uint) }
```

### Data Variables

**habit-id-nonce:** `uint`  
Counter for generating unique habit IDs

**forfeited-pool-balance:** `uint`  
Total STX in forfeited pool (in microSTX)

---

## Events

All public functions emit print events with relevant data.

### habit-created Event
```clarity
{
  event: "habit-created",
  habit-id: uint,
  owner: principal,
  stake-amount: uint,
  block: uint
}
```

### habit-checked-in Event
```clarity
{
  event: "habit-checked-in",
  habit-id: uint,
  owner: principal,
  new-streak: uint,
  block: uint
}
```

### stake-withdrawn Event
```clarity
{
  event: "stake-withdrawn",
  habit-id: uint,
  owner: principal,
  amount: uint,
  final-streak: uint,
  block: uint
}
```

### bonus-claimed Event
```clarity
{
  event: "bonus-claimed",
  habit-id: uint,
  owner: principal,
  amount: uint,
  remaining-pool: uint,
  block: uint
}
```

---

## Usage Examples

### Creating and Completing a Habit

```clarity
;; Step 1: Create habit
(contract-call? '.habit-tracker create-habit u"Daily Meditation" u200000)
;; Returns: (ok u1)

;; Step 2: Check in daily for 7 days
(contract-call? '.habit-tracker check-in u1)
;; Day 1: (ok u1)
;; ... wait 145 blocks
;; Day 2: (ok u2)
;; ... continue for 7 days

;; Step 3: Withdraw stake
(contract-call? '.habit-tracker withdraw-stake u1)
;; Returns: (ok u200000)

;; Step 4: Claim bonus (if pool has balance)
(contract-call? '.habit-tracker claim-bonus u1)
;; Returns: (ok u[bonus-amount])
```

### Querying User Data

```clarity
;; Get all user habits
(contract-call? '.habit-tracker get-user-stats 'SP...)
;; Returns total habits and IDs

;; Get specific habit details
(contract-call? '.habit-tracker get-habit u1)
;; Returns full habit data

;; Check current streak
(contract-call? '.habit-tracker get-habit-streak u1)
;; Returns streak count
```

---

## Integration Notes

### Web3 Integration

Use `@stacks/transactions` and `@stacks/connect`:

```typescript
import { openContractCall } from '@stacks/connect';
import { uintCV, stringUtf8CV } from '@stacks/transactions';

const txOptions = {
  contractAddress: 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193',
  contractName: 'habit-tracker',
  functionName: 'create-habit',
  functionArgs: [
    stringUtf8CV('Morning Exercise'),
    uintCV(500000)
  ],
  network: new StacksMainnet(),
};

await openContractCall(txOptions);
```

### Rate Limiting

No built-in rate limiting. Frontend should implement:
- Check-in cooldown (14 blocks minimum)
- Transaction queue management
- User-side validation before submission

### Best Practices

1. **Always verify ownership** before calling write functions
2. **Use read-only functions** to validate state before transactions
3. **Handle errors gracefully** with user-friendly messages
4. **Cache read-only results** to reduce API calls
5. **Validate inputs client-side** before submitting transactions

---

## Support

- **Contract Explorer:** https://explorer.hiro.so/txid/SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker?chain=mainnet
- **Documentation:** https://github.com/Yusufolosun/AhhbitTracker
- **Issues:** https://github.com/Yusufolosun/AhhbitTracker/issues
