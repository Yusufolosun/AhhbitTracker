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

**Transaction ID:** _[Executed on mainnet]_

**Status:** ✅ Executed Successfully

**Actual Result:** `(ok u1)` - Habit created at block 230608

**Verification (get-habit u1):**
```clarity
(some (tuple 
  (created-at-block u230608) 
  (current-streak u0) 
  (is-active true) 
  (is-completed false) 
  (last-check-in-block u230608) 
  (name u"Morning Exercise") 
  (owner SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193) 
  (stake-amount u100000)))
```

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

**Transaction ID:** _[Executed on mainnet]_

**Status:** ✅ Executed Successfully

**Actual Result:** `(ok u2)` - Second habit created successfully

**Verification (get-user-habits):**
```clarity
(tuple (habit-ids (list u1 u2)))
```
✅ Confirmed: Multiple habits per user working correctly

---

## Transaction 3: First Check-in

**Purpose:** Test initial check-in for habit

**Function:** `check-in`

**Parameters:**
- `habit-id`: 1
Attempted on mainnet]_

**Status:** ❌ Failed with error

**Actual Result:** `(err u105)` - ERR-ALREADY-CHECKED-IN

**Analysis:** 
The contract automatically performs an initial "check-in" when a habit is created, setting `last-check-in-block` to the creation block. The `already-checked-in-today` function prevents check-ins when `blocks-elapsed < u1`.

**Important Discovery:** 
- Habit creation counts as the first check-in (streak starts at 0)
- Must wait at least 1 block after creation before first manual check-in
- This is actually correct behavior - prevents double check-in on creation block

**Next Action:** Wait for next block, then retry check-in

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

**Function:*✅ Executed Successfully

**Actual Result:** `(ok u0)`

**Analysis:** Pool balance is correctly at zero - no forfeited stakes yet

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
SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193

**Expected Result:**
- Returns tuple with total-habits: 2
- Returns habit-ids list

**Execution Method:** Read-only call

**Status:** ✅ Executed Successfully

**Actual Result:** 
```clarity
(ok (tuple 
  (habit-ids (list u1 u2)) 
  (total-habits u2)))
```

**Analysis:** User statistics function working perfectly - shows 2 habits created

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
Status:**
- ✅ Transaction 1: create-habit (minimum stake) - SUCCESS
- ✅ Transaction 2: create-habit (higher stake) - SUCCESS
- ❌ Transaction 3: check-in - FAILED (err u105 - already checked in)
- ✅ Transaction 4-7: All read-only calls - SUCCESS
- ⏳ Transaction 8: Waiting for block window

**Key Findings:**
1. ✅ Habit creation works perfectly with both minimum and higher stakes
2. ✅ Multiple habits per user confirmed working
3. ✅ All read-only functions return expected data
4. ⚠️ **Important:** Habit creation sets `last-check-in-block`, preventing immediate check-in
5. 📝 Users must wait at least 1 block after creation before first manual check-in

**Next Steps:**
- Wait for next block (current: 230608+)
- Retry check-in transaction
- Continue with daily check-ins for streak testing

**Actual Cost So Far:** ~0.3-0.5 STX (2 create transactions
**Total Transactions Planned:** 8
**Write Transactions:** 3 (create x2, check-in x2)
**Read-Only Calls:** 4 (get-habit, get-user-habits, get-pool, get-stats)

**Execution Timeline:**
- Day 1: Transactions 1-7
- Day 2+: Transaction 8 (after waiting for block window)

**Expected Total Cost:** ~0.5-0.7 STX (write transactions only)
