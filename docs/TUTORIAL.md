# Step-by-Step Tutorial

## Tutorial: Create Your First Habit

This tutorial walks you through creating and completing your first habit on AhhbitTracker.

**Time required:** 7+ days  
**Cost:** ~5 STX total (stake + fees)

---

## Prerequisites

Before starting, ensure you have:

- [ ] Stacks wallet installed and set up
- [ ] At least 2 STX in your wallet
- [ ] Access to Clarinet or web interface

---

## Part 1: Create a Habit (Day 1)

### Step 1: Prepare Your Command

You'll create a habit with these parameters:
- **Name:** "Daily Exercise"
- **Stake:** 1 STX (1,000,000 microSTX)

### Step 2: Open Clarinet Console

\`\`\`bash
clarinet console --mainnet
\`\`\`

### Step 3: Execute Transaction

Copy and paste this command:

\`\`\`clarity
(contract-call? 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker 
  create-habit 
  u"Daily Exercise" 
  u1000000)
\`\`\`

### Step 4: Confirm Transaction

- Review the transaction details
- Confirm the fee
- Sign with your wallet

### Expected Result

\`\`\`clarity
(ok u1)
\`\`\`

This means your habit was created with ID \`1\`.

### Step 5: Verify Creation

\`\`\`clarity
(contract-call? 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker 
  get-habit 
  u1)
\`\`\`

You should see your habit data including:
- \`owner\`: Your address
- \`name\`: "Daily Exercise"
- \`stake-amount\`: 1000000
- \`current-streak\`: 0
- \`is-active\`: true

**✅ Checkpoint:** Habit created successfully

---

## Part 2: First Check-in (Day 1)

### Step 1: Execute Check-in

\`\`\`clarity
(contract-call? 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker 
  check-in 
  u1)
\`\`\`

### Expected Result

\`\`\`clarity
(ok u1)
\`\`\`

Your streak is now 1!

### Step 2: Verify Streak

\`\`\`clarity
(contract-call? 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker 
  get-habit-streak 
  u1)
\`\`\`

Should return: \`(ok u1)\`

**✅ Checkpoint:** First check-in complete

---

## Part 3: Daily Check-ins (Days 2-7)

### Day 2 Morning

**Wait at least 145 blocks (~24 hours) after Day 1 check-in**

\`\`\`clarity
(contract-call? 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker 
  check-in 
  u1)
\`\`\`

Expected: \`(ok u2)\`

### Day 3 Morning

**Wait 145 blocks after Day 2**

\`\`\`clarity
(contract-call? 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker 
  check-in 
  u1)
\`\`\`

Expected: \`(ok u3)\`

### Days 4-7

Repeat the check-in command each day, waiting 145 blocks between each.

**Pro tip:** Set a daily reminder at the same time each day.

**✅ Checkpoint:** 7-day streak achieved

---

## Part 4: Withdraw Your Stake (Day 7+)

### Step 1: Verify Streak

\`\`\`clarity
(contract-call? 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker 
  get-habit-streak 
  u1)
\`\`\`

Should return: \`(ok u7)\` or higher

### Step 2: Execute Withdrawal

\`\`\`clarity
(contract-call? 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker 
  withdraw-stake 
  u1)
\`\`\`

### Expected Result

\`\`\`clarity
(ok u1000000)
\`\`\`

Your 1 STX stake is returned to your wallet!

### Step 3: Verify Completion

\`\`\`clarity
(contract-call? 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker 
  get-habit 
  u1)
\`\`\`

Should show:
- \`is-active\`: false
- \`is-completed\`: true

**✅ Checkpoint:** Stake withdrawn successfully

---

## Part 5: Claim Bonus (Optional)

If the forfeited pool has balance, claim your share.

### Step 1: Check Pool Balance

\`\`\`clarity
(contract-call? 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker 
  get-pool-balance)
\`\`\`

If greater than 0, proceed to claim.

### Step 2: Claim Bonus

\`\`\`clarity
(contract-call? 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker 
  claim-bonus 
  u1)
\`\`\`

### Expected Result

\`\`\`clarity
(ok u[bonus-amount])
\`\`\`

**✅ Checkpoint:** Bonus claimed (if available)

---

## Troubleshooting

### "Already Checked In" Error

**Problem:** Trying to check in too soon after last check-in

**Solution:** Wait at least 14 blocks (~2.4 hours) between check-ins

### "Window Expired" Error

**Problem:** Waited more than 144 blocks since last check-in

**Solution:** Unfortunately, your stake is forfeited. Start a new habit and set reminders.

### "Insufficient Streak" Error

**Problem:** Trying to withdraw before 7 consecutive check-ins

**Solution:** Continue checking in until you reach 7 days

---

## Next Steps

**Congratulations!** You've completed your first habit.

### What's Next?

1. **Create another habit** - Build multiple healthy habits
2. **Increase stakes** - Higher commitment for important goals
3. **Help others** - Share your experience
4. **Track progress** - Use \`get-user-stats\` to see your achievements

### Advanced Usage

- Create multiple concurrent habits
- Experiment with different stake amounts
- Track habit completion rates
- Monitor the forfeited pool growth

---

## Quick Reference

### Create Habit
\`\`\`clarity
(contract-call? '.habit-tracker create-habit u"[NAME]" u[AMOUNT])
\`\`\`

### Check In
\`\`\`clarity
(contract-call? '.habit-tracker check-in u[HABIT-ID])
\`\`\`

### Withdraw
\`\`\`clarity
(contract-call? '.habit-tracker withdraw-stake u[HABIT-ID])
\`\`\`

### Get Habit
\`\`\`clarity
(contract-call? '.habit-tracker get-habit u[HABIT-ID])
\`\`\`

---

**Ready to build your next habit? You've got this!**
