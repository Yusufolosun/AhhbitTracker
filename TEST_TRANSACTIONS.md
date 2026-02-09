# Mainnet Transaction Test Log

## Test Environment

**Contract:** `SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker`
**Network:** Stacks Mainnet
**Test Date:** February 9, 2026

---

## Transaction 1: Create Habit - Minimum Stake

**Purpose:** Test habit creation with minimum stake (0.1 STX)

**Function:** `create-habit`

**Parameters:**
- `name`: "Morning Exercise"
- `stake-amount`: 100000 (0.1 STX in microSTX)

**Expected Result:** 
- Returns `(ok u1)` - First habit ID
- STX transferred from user to contract
- Habit stored in contract state

**Transaction ID:** _[To be filled after execution]_

**Status:** ⏳ Pending execution

**Actual Result:** _[To be filled]_

---

## Transaction 2: Create Habit - Higher Stake

**Purpose:** Test habit creation with above-minimum stake

**Function:** `create-habit`

**Parameters:**
- `name`: "Daily Reading"
- `stake-amount`: 1000000 (1.0 STX)

**Expected Result:**
- Returns `(ok u2)` - Second habit ID
- Multiple habits per user confirmed

**Transaction ID:** _[To be filled]_

**Status:** ⏳ Pending execution

**Actual Result:** _[To be filled]_

---

## Transaction 3: First Check-in

**Purpose:** Test initial check-in for habit

**Function:** `check-in`

**Parameters:**
- `habit-id`: 1

**Expected Result:**
- Returns `(ok u1)` - Streak count of 1
- Last check-in block updated
- Habit streak incremented

**Transaction ID:** _[To be filled]_

**Status:** ⏳ Pending execution (after Transaction 1)

**Actual Result:** _[To be filled]_

---

## Transaction 4: Get Habit (Read-Only)

**Purpose:** Test habit data retrieval

**Function:** `get-habit`

**Parameters:**
- `habit-id`: 1

**Expected Result:**
- Returns habit data tuple
- Shows owner, name, stake, streak, timestamps

**Execution Method:** Read-only call (no transaction)

**Status:** ⏳ Pending execution

**Actual Result:** _[To be filled]_

---

## Transaction 5: Get User Habits (Read-Only)

**Purpose:** Test user habit list retrieval

**Function:** `get-user-habits`

**Parameters:**
- `user`: [Deployer principal]

**Expected Result:**
- Returns `{habit-ids: (list u1 u2)}`
- Shows both created habits

**Execution Method:** Read-only call

**Status:** ⏳ Pending execution

**Actual Result:** _[To be filled]_

---

## Transaction 6: Get Pool Balance (Read-Only)

**Purpose:** Test forfeited pool balance query

**Function:** `get-pool-balance`

**Parameters:** None

**Expected Result:**
- Returns `(ok u0)`
- Pool starts at zero

**Execution Method:** Read-only call

**Status:** ⏳ Pending execution

**Actual Result:** _[To be filled]_

---

## Transaction 7: Get User Stats (Read-Only)

**Purpose:** Test aggregated user statistics

**Function:** `get-user-stats`

**Parameters:**
- `user`: [Deployer principal]

**Expected Result:**
- Returns tuple with total-habits: 2
- Returns habit-ids list

**Execution Method:** Read-only call

**Status:** ⏳ Pending execution

**Actual Result:** _[To be filled]_

---

## Transaction 8: Second Check-in

**Purpose:** Test consecutive check-in after 24 hours

**Function:** `check-in`

**Parameters:**
- `habit-id`: 1

**Expected Result:**
- Returns `(ok u2)` - Streak count of 2
- Streak successfully incremented

**Transaction ID:** _[To be filled]_

**Status:** ⏳ Pending execution (wait 144 blocks after Transaction 3)

**Note:** Must wait ~24 hours (144 blocks) after first check-in

**Actual Result:** _[To be filled]_

---

## Summary

**Total Transactions Planned:** 8
**Write Transactions:** 3 (create x2, check-in x2)
**Read-Only Calls:** 4 (get-habit, get-user-habits, get-pool, get-stats)

**Execution Timeline:**
- Day 1: Transactions 1-7
- Day 2+: Transaction 8 (after waiting for block window)

**Expected Total Cost:** ~0.5-0.7 STX (write transactions only)
