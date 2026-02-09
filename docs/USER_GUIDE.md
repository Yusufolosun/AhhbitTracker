# AhhbitTracker User Guide

## Welcome

AhhbitTracker is a blockchain-based habit tracking system that uses financial commitment to help you build lasting habits.

## How It Works

### 1. Stake STX on Your Habit

When you create a habit, you stake STX tokens as a commitment. The minimum stake is 0.1 STX.

**Why stake?** Financial commitment creates real accountability.

### 2. Check In Daily

Every 24 hours, check in to prove you're following through. Each successful check-in increases your streak.

**Important:** You have a 24-hour window (144 blocks) to check in.

### 3. Complete or Forfeit

- **Complete:** Check in for 7+ consecutive days, then withdraw your stake
- **Forfeit:** Miss a check-in window and your stake goes to the community pool

### 4. Earn Bonuses

Successful users can claim bonuses from the forfeited pool created by users who missed their check-ins.

## Getting Started

### Prerequisites

- Stacks wallet (Leather, Xverse, or Asigna)
- Minimum 0.1 STX plus transaction fees

### Creating Your First Habit

1. Connect your Stacks wallet
2. Click "Create New Habit"
3. Enter habit name (e.g., "Morning Exercise")
4. Set your stake amount (minimum 0.1 STX)
5. Confirm the transaction

**Transaction cost:** ~0.15-0.25 STX

### Daily Check-ins

1. Visit AhhbitTracker once per day
2. Click "Check In" on your active habit
3. Confirm the transaction

**Transaction cost:** ~0.10-0.20 STX per check-in

### Withdrawing Your Stake

After completing 7+ consecutive check-ins:

1. Click "Withdraw Stake" on your completed habit
2. Confirm the transaction
3. Your stake is returned to your wallet

**Transaction cost:** ~0.15-0.25 STX

## Understanding Streaks

### Streak Rules

- **First check-in:** Starts your streak at 1
- **Each consecutive check-in:** Adds 1 to your streak
- **Missed window:** Resets streak to 0 and forfeits stake

### Check-in Window

You must check in within 144 blocks (~24 hours) of your last check-in.

**Example timeline:**
- Monday 9:00 AM: First check-in (streak = 1)
- Tuesday before 9:00 AM: Second check-in (streak = 2)
- Tuesday after 9:00 AM: Window expires, stake forfeited

### Multiple Habits

You can track multiple habits simultaneously. Each habit:
- Has its own stake
- Maintains its own streak
- Operates independently

## The Forfeited Pool

### How It Works

When users miss check-ins, their stakes are added to a shared pool.

### Claiming Bonuses

Users who successfully complete habits can claim a share of the pool:

1. Complete a habit (7+ day streak)
2. Withdraw your original stake
3. Click "Claim Bonus"
4. Receive your share of forfeited stakes

**Bonus calculation:** Pool distributed among successful users

## Best Practices

### Choose Achievable Habits

Start with habits you can realistically maintain daily:
- ✅ "10-minute walk"
- ✅ "Read one page"
- ❌ "Run a marathon"
- ❌ "Read entire book"

### Set Meaningful Stakes

Higher stakes = stronger commitment, but start reasonable:
- Beginner: 0.1-0.5 STX
- Intermediate: 0.5-2.0 STX
- Advanced: 2.0+ STX

### Create Check-in Reminders

Set daily reminders to check in before your window expires.

### Track Multiple Habits Gradually

Don't overwhelm yourself:
- Week 1: One habit
- Week 2-3: Add second habit if first is stable
- Week 4+: Consider third habit

## Costs and Economics

### Transaction Costs

| Action | Estimated Cost |
|--------|----------------|
| Create habit | 0.15-0.25 STX |
| Daily check-in | 0.10-0.20 STX |
| Withdraw stake | 0.15-0.25 STX |
| Claim bonus | 0.15-0.25 STX |

### Monthly Cost Example

For one habit with daily check-ins:
- Creation: 0.20 STX
- 30 check-ins: 4.50 STX
- Withdrawal: 0.20 STX
- **Total:** ~4.90 STX

**Plus your stake:** If you stake 1 STX, total commitment is ~5.90 STX

### Return on Investment

If you complete your habit:
- Recover: Your original stake
- Earn: Share of forfeited pool
- **Net result:** Potentially profit from others' failures

## Troubleshooting

### "Already Checked In" Error

You've already checked in today. Wait 14+ blocks (~2.4 hours) before next check-in.

### "Window Expired" Error

You missed your 24-hour check-in window. Your stake has been forfeited to the pool.

### "Insufficient Streak" Error

You need 7+ consecutive check-ins before withdrawing your stake.

### Transaction Failed

Common causes:
- Insufficient STX balance
- Incorrect habit ID
- Network congestion

**Solution:** Check your wallet balance and try again.

## FAQ

**Q: What if I'm traveling and can't check in?**

A: Unfortunately, you'll forfeit your stake. Consider the check-in requirement before committing.

**Q: Can I delete a habit?**

A: No. Habits are permanent on the blockchain. You can only complete them or forfeit.

**Q: How is the bonus pool distributed?**

A: Shared among users who successfully complete habits.

**Q: What happens if no one forfeits?**

A: The pool remains at zero. Bonuses only exist when stakes are forfeited.

**Q: Can I increase my stake mid-habit?**

A: No. Stake amount is locked when you create the habit.

**Q: Is my data private?**

A: All transactions are public on the Stacks blockchain.

## Getting Help

- **Contract Address:** `SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker`
- **Documentation:** [GitHub Repository](https://github.com/Yusufolosun/AhhbitTracker)
- **Issues:** Report bugs via GitHub Issues

## Tips for Success

1. **Start small** - Build the check-in habit before adding complexity
2. **Be consistent** - Same time each day works best
3. **Use technology** - Set phone reminders
4. **Stay motivated** - Remember your financial commitment
5. **Track progress** - Celebrate each streak milestone

---

**Ready to build better habits? Start your journey today!**
