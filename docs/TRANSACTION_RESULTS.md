# Transaction Results and Analysis

## Overview

This document records actual transaction results from mainnet testing.

## Test Results Summary

**Test Date:** February 9, 2026
**Contract:** `SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker`
**Tester:** Deployer account

### Results Table

| # | Transaction | Status | TX ID | Cost | Block | Notes |
|---|-------------|--------|-------|------|-------|-------|
| 1 | create-habit | ⏳ | - | - | - | Min stake test |
| 2 | create-habit | ⏳ | - | - | - | Higher stake test |
| 3 | check-in | ⏳ | - | - | - | First check-in |
| 4 | get-habit | ⏳ | - | Free | - | Read-only |
| 5 | get-user-habits | ⏳ | - | Free | - | Read-only |
| 6 | get-pool-balance | ⏳ | - | Free | - | Read-only |
| 7 | get-user-stats | ⏳ | - | Free | - | Read-only |
| 8 | check-in | ⏳ | - | - | - | Second check-in |

---

## Detailed Results

### Transaction 1: Create Habit (Min Stake)

**Status:** ⏳ Awaiting execution

**Command Used:**
```clarity
(contract-call? .habit-tracker create-habit u"Morning Exercise" u100000)
```

**Expected:** `(ok u1)`

**Actual:** _[To be filled]_

**Transaction Fee:** _[To be filled]_

**Analysis:** _[To be filled]_

---

### Transaction 2: Create Habit (Higher Stake)

**Status:** ⏳ Awaiting execution

**Command Used:**
```clarity
(contract-call? .habit-tracker create-habit u"Daily Reading" u1000000)
```

**Expected:** `(ok u2)`

**Actual:** _[To be filled]_

**Analysis:** _[To be filled]_

---

### Transaction 3: First Check-in

**Status:** ⏳ Awaiting execution

**Prerequisites:** Transaction 1 must complete first

**Command Used:**
```clarity
(contract-call? .habit-tracker check-in u1)
```

**Expected:** `(ok u1)`

**Actual:** _[To be filled]_

**Analysis:** _[To be filled]_

---

### Query 4: Get Habit Data

**Status:** ⏳ Awaiting execution

**Command Used:**
```clarity
(contract-call? .habit-tracker get-habit u1)
```

**Expected:**
```clarity
(some {
  owner: 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193,
  name: u"Morning Exercise",
  stake-amount: u100000,
  current-streak: u1,
  is-active: true,
  is-completed: false
})
```

**Actual:** _[To be filled]_

---

### Query 5: Get User Habits

**Status:** ⏳ Awaiting execution

**Command Used:**
```clarity
(contract-call? .habit-tracker get-user-habits 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193)
```

**Expected:** `{habit-ids: (list u1 u2)}`

**Actual:** _[To be filled]_

---

### Query 6: Get Pool Balance

**Status:** ⏳ Awaiting execution

**Command Used:**
```clarity
(contract-call? .habit-tracker get-pool-balance)
```

**Expected:** `(ok u0)`

**Actual:** _[To be filled]_

---

### Query 7: Get User Stats

**Status:** ⏳ Awaiting execution

**Command Used:**
```clarity
(contract-call? .habit-tracker get-user-stats 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193)
```

**Expected:**
```clarity
(ok {
  total-habits: u2,
  habit-ids: (list u1 u2)
})
```

**Actual:** _[To be filled]_

---

### Transaction 8: Second Check-in

**Status:** ⏳ Awaiting execution (wait 144 blocks)

**Prerequisites:** 
- Transaction 3 complete
- 144 blocks elapsed (~24 hours)

**Command Used:**
```clarity
(contract-call? .habit-tracker check-in u1)
```

**Expected:** `(ok u2)`

**Actual:** _[To be filled]_

**Analysis:** _[To be filled]_

---

## Gas Cost Analysis

**Total Estimated Cost:** ~0.5-0.7 STX

**Breakdown:**
- create-habit (×2): ~0.4 STX
- check-in (×2): ~0.3 STX
- Read-only calls: Free

**Actual Total Cost:** _[To be filled after execution]_

---

## Findings and Observations

_[To be filled after test completion]_

### Successful Operations

- _[List successful transactions]_

### Failed Operations

- _[List any failures with error analysis]_

### Performance Notes

- _[Transaction confirmation times]_
- _[Gas efficiency observations]_

---

## Recommendations

_[Post-test recommendations for optimization or improvements]_
