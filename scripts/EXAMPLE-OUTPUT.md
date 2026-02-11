# Example Execution Output

## Start

```
══════════════════════════════════════════════════════════════════════
    AHHBITTRACKER - AUTOMATED TRANSACTION EXECUTOR
══════════════════════════════════════════════════════════════════════

🔐 WALLET SETUP
──────────────────────────────────────────────────────────────────────

⚠️  IMPORTANT: Use a wallet DIFFERENT from the deployer wallet
⚠️  This wallet must have at least 3 STX (budget + buffer)

Enter your private key (64-char hex): ****************************************************************

✅ Wallet Address: SP2ABC123XYZ456...

💰 BALANCE CHECK
──────────────────────────────────────────────────────────────────────
Current Balance: 5.2500 STX
✅ Balance check passed

📊 EXECUTION PLAN
──────────────────────────────────────────────────────────────────────
Contract: SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker
Network: Stacks Mainnet
Total Transactions: 40
Total Budget: 2.5 STX
Fee per Transaction: 0.0625 STX
Delay Between Tx: 120 seconds

Transaction Distribution:
  • create-habit: 10 transactions (0.1 STX stake each)
  • check-in: 20 transactions (across created habits)
  • withdraw-stake: 5 transactions (will fail without 7-day streak)
  • claim-bonus: 5 transactions (will fail if pool empty)

⚠️  WARNING: This will execute REAL transactions on mainnet
⚠️  Transactions are irreversible
⚠️  Estimated duration: ~80 minutes

Type "EXECUTE" to proceed: EXECUTE

🚀 STARTING EXECUTION
══════════════════════════════════════════════════════════════════════

Starting nonce: 42

[1/40] Create Habit...
   ✅ Submitted: 0xabc123def456789...
   📎 https://explorer.hiro.so/txid/0xabc123def456789...?chain=mainnet
   ⏳ Waiting 120 seconds...

[2/40] Create Habit...
   ✅ Submitted: 0x789xyz012abc345...
   📎 https://explorer.hiro.so/txid/0x789xyz012abc345...?chain=mainnet
   ⏳ Waiting 120 seconds...

[3/40] Create Habit...
   ✅ Submitted: 0x456def789ghi012...
   📎 https://explorer.hiro.so/txid/0x456def789ghi012...?chain=mainnet
   ⏳ Waiting 120 seconds...

...

[10/40] Create Habit...
   ✅ Submitted: 0x901jkl234mno567...
   📎 https://explorer.hiro.so/txid/0x901jkl234mno567...?chain=mainnet
   ⏳ Waiting 120 seconds...

[11/40] Check In...
   ✅ Submitted: 0x234pqr567stu890...
   📎 https://explorer.hiro.so/txid/0x234pqr567stu890...?chain=mainnet
   ⏳ Waiting 120 seconds...

...

[30/40] Check In...
   ✅ Submitted: 0x567vwx890yza123...
   📎 https://explorer.hiro.so/txid/0x567vwx890yza123...?chain=mainnet
   ⏳ Waiting 120 seconds...

[31/40] Withdraw Stake...
   ❌ Failed: Insufficient streak (err u107)

[32/40] Withdraw Stake...
   ❌ Failed: Insufficient streak (err u107)

[33/40] Withdraw Stake...
   ❌ Failed: Insufficient streak (err u107)

[34/40] Withdraw Stake...
   ❌ Failed: Insufficient streak (err u107)

[35/40] Withdraw Stake...
   ❌ Failed: Insufficient streak (err u107)

[36/40] Claim Bonus...
   ❌ Failed: Pool insufficient balance (err u109)

[37/40] Claim Bonus...
   ❌ Failed: Pool insufficient balance (err u109)

[38/40] Claim Bonus...
   ❌ Failed: Pool insufficient balance (err u109)

[39/40] Claim Bonus...
   ❌ Failed: Pool insufficient balance (err u109)

[40/40] Claim Bonus...
   ❌ Failed: Pool insufficient balance (err u109)

══════════════════════════════════════════════════════════════════════
    EXECUTION COMPLETE
══════════════════════════════════════════════════════════════════════

📊 SUMMARY
──────────────────────────────────────────────────────────────────────
Total Attempted: 40
Successfully Submitted: 30
Failed: 10
Success Rate: 75.0%

Total Cost: 1.8750 STX
Budget Used: 75.0%

Results saved to: scripts/transaction-results.json

🔗 VIEW TRANSACTIONS
──────────────────────────────────────────────────────────────────────
create-habit: https://explorer.hiro.so/txid/0xabc123def456789...?chain=mainnet
create-habit: https://explorer.hiro.so/txid/0x789xyz012abc345...?chain=mainnet
create-habit: https://explorer.hiro.so/txid/0x456def789ghi012...?chain=mainnet
check-in: https://explorer.hiro.so/txid/0x234pqr567stu890...?chain=mainnet
check-in: https://explorer.hiro.so/txid/0x567vwx890yza123...?chain=mainnet
... and 25 more in scripts/transaction-results.json

══════════════════════════════════════════════════════════════════════
```

## Sample transaction-results.json

```json
[
  {
    "index": 1,
    "functionName": "create-habit",
    "txId": "0xabc123def456789abcdef0123456789abcdef0123456789abcdef0123456789ab",
    "status": "submitted",
    "fee": 62500,
    "timestamp": 1707668400000
  },
  {
    "index": 2,
    "functionName": "create-habit",
    "txId": "0x789xyz012abc345def678901abc234def5678901abc234def5678901abc234de",
    "status": "submitted",
    "fee": 62500,
    "timestamp": 1707668520000
  },
  {
    "index": 3,
    "functionName": "create-habit",
    "txId": "0x456def789ghi012jkl345mno678pqr901stu234vwx567yza890bcd123efg456",
    "status": "submitted",
    "fee": 62500,
    "timestamp": 1707668640000
  },
  {
    "index": 10,
    "functionName": "create-habit",
    "txId": "0x901jkl234mno567pqr890stu123vwx456yza789bcd012efg345hij678klm901",
    "status": "submitted",
    "fee": 62500,
    "timestamp": 1707669480000
  },
  {
    "index": 11,
    "functionName": "check-in",
    "txId": "0x234pqr567stu890vwx123yza456bcd789efg012hij345klm678nop901qrs234",
    "status": "submitted",
    "fee": 62500,
    "timestamp": 1707669600000
  },
  {
    "index": 30,
    "functionName": "check-in",
    "txId": "0x567vwx890yza123bcd456efg789hij012klm345nop678qrs901tuv234wxy567",
    "status": "submitted",
    "fee": 62500,
    "timestamp": 1707671880000
  },
  {
    "index": 31,
    "functionName": "withdraw-stake",
    "txId": "",
    "status": "failed",
    "fee": 0,
    "timestamp": 1707672000000,
    "error": "Insufficient streak (err u107)"
  },
  {
    "index": 32,
    "functionName": "withdraw-stake",
    "txId": "",
    "status": "failed",
    "fee": 0,
    "timestamp": 1707672120000,
    "error": "Insufficient streak (err u107)"
  },
  {
    "index": 36,
    "functionName": "claim-bonus",
    "txId": "",
    "status": "failed",
    "fee": 0,
    "timestamp": 1707672600000,
    "error": "Pool insufficient balance (err u109)"
  },
  {
    "index": 40,
    "functionName": "claim-bonus",
    "txId": "",
    "status": "failed",
    "fee": 0,
    "timestamp": 1707673080000,
    "error": "Pool insufficient balance (err u109)"
  }
]
```

## Analysis

### Success Breakdown

| Function | Attempted | Succeeded | Failed | Success Rate |
|----------|-----------|-----------|--------|--------------|
| create-habit | 10 | 10 | 0 | 100% |
| check-in | 20 | 20 | 0 | 100% |
| withdraw-stake | 5 | 0 | 5 | 0% (expected) |
| claim-bonus | 5 | 0 | 5 | 0% (expected) |
| **Total** | **40** | **30** | **10** | **75%** |

### Expected Failures

1. **withdraw-stake failures**: Expected because habits don't have 7-day streaks yet
2. **claim-bonus failures**: Expected because forfeited pool has no balance yet

### Cost Analysis

- Successful transactions: 30
- Fee per transaction: 0.0625 STX
- Total cost: 30 × 0.0625 = 1.875 STX
- Budget used: 75.0%
- Remaining budget: 0.625 STX

### Timeline

- Start time: 12:00:00 PM
- End time: 1:18:00 PM (78 minutes)
- Average delay: 120 seconds between transactions
- Total duration: ~1 hour 18 minutes

---

## Key Takeaways

✅ **All habit creations succeeded** - Contract is working correctly
✅ **All check-ins succeeded** - Check-in mechanism functional
✅ **Expected failures occurred** - Contract validations working as designed
✅ **Budget maintained** - Stayed well within 2.5 STX limit
✅ **Complete transaction log** - All results recorded for analysis
