# Frequently Asked Questions

## General Questions

### What is AhhbitTracker?

AhhbitTracker is a decentralized application on the Stacks blockchain that helps you build habits through financial commitment. You stake STX on your habits and check in daily to maintain your streak.

### How does it work?

1. Stake STX on a habit
2. Check in every 24 hours
3. Complete 7+ days to withdraw your stake
4. Miss a check-in and forfeit your stake to the community pool

### Why use blockchain for habit tracking?

- **Immutable:** Your commitments can't be changed
- **Transparent:** All activity is publicly verifiable
- **Incentivized:** Financial stakes create real accountability
- **Decentralized:** No company can shut down or alter your data

## Getting Started

### What do I need?

- Stacks wallet (Leather, Xverse, or Asigna recommended)
- Minimum 0.1 STX for stake
- Additional STX for transaction fees (~0.5 STX for 7-day completion)

### How do I create a wallet?

Download one of these wallets:
- **Leather:** https://leather.io
- **Xverse:** https://xverse.app
- **Asigna:** https://asigna.io

Follow their setup instructions to create your wallet and backup your seed phrase.

### Where do I get STX?

Purchase STX from:
- Cryptocurrency exchanges (Coinbase, Binance, etc.)
- Peer-to-peer platforms
- DEX platforms on Stacks

## Using the Contract

### What's the minimum stake?

0.1 STX (100,000 microSTX)

### Can I stake more?

Yes! There's no maximum. Higher stakes = stronger commitment.

### How often must I check in?

Once every 24 hours (144 blocks on Stacks).

### What if I miss a day?

Your stake is forfeited to the community pool and your streak resets to zero.

### Can I check in multiple times per day?

No. The contract prevents check-ins within 14 blocks (~2.4 hours) to ensure one check-in per day.

### How many days for withdrawal?

Minimum 7 consecutive check-ins required.

### Can I withdraw before 7 days?

No. You must complete the minimum streak or forfeit your stake.

## Streaks and Timing

### When does my 24-hour window start?

Immediately after your last check-in. If you check in at 9 AM Monday, you have until 9 AM Tuesday.

### What if I'm traveling across time zones?

The contract uses blockchain time (block height), not wall clock time. Your 24-hour window is always 144 blocks regardless of your location.

### Can I check in early?

Yes! Check in anytime within your 24-hour window. Earlier is safer than later.

### What happens if Stacks network is slow?

Transaction delays can cause you to miss your window. Always check in with buffer time (e.g., 20 hours instead of 23.5 hours).

## Forfeited Pool

### What is the forfeited pool?

A shared pool of STX from users who missed their check-ins.

### How do I claim bonuses?

After completing a habit (7+ days), use the \`claim-bonus\` function to receive your share.

### How is the bonus calculated?

The pool is distributed among successful users. More forfeited stakes = larger bonuses.

### Can I claim bonuses multiple times?

Yes, once per completed habit.

### What if the pool is empty?

You can still withdraw your original stake, but there won't be a bonus.

## Costs and Fees

### How much does it cost?

**One-time costs:**
- Habit creation: ~0.15-0.25 STX

**Recurring costs:**
- Daily check-in: ~0.10-0.20 STX

**End costs:**
- Withdrawal: ~0.15-0.25 STX
- Bonus claim: ~0.15-0.25 STX

### Why are there transaction fees?

Stacks blockchain requires fees to process transactions and prevent spam.

### Do fees go to you?

No. All transaction fees go to Stacks miners, not to AhhbitTracker.

### Can I reduce costs?

- Use "low-cost" deployment mode
- Batch multiple habits together
- Check in during low network congestion

## Multiple Habits

### Can I track multiple habits?

Yes! Create as many as you want.

### Does each habit need its own stake?

Yes. Each habit requires a separate stake.

### Do habits affect each other?

No. Each habit has an independent stake and streak.

### Can I use the same name for multiple habits?

Yes, but habit IDs are unique. Using different names helps you distinguish them.

## Technical Questions

### What blockchain is this on?

Stacks (STX) - a Bitcoin layer for smart contracts.

### Is the contract open source?

Yes. View the code at: https://github.com/Yusufolosun/AhhbitTracker

### Can the contract be changed?

No. Once deployed, the contract is immutable. No one can modify the rules.

### Where is my data stored?

On the Stacks blockchain. All data is permanent and public.

### Is my data private?

No. All blockchain transactions are public. Anyone can see:
- Your habits
- Your stakes
- Your check-ins
- Your streaks

**NOT visible:** Your personal identity (only your blockchain address)

## Troubleshooting

### Transaction failed

**Possible causes:**
- Insufficient STX balance
- Network congestion
- Incorrect parameters

**Solution:**
- Check wallet balance
- Increase transaction fee
- Wait and retry

### "Already Checked In" error

You've checked in today already. Wait 14+ blocks before next check-in.

### "Window Expired" error

You missed your 24-hour window. Your stake has been forfeited.

### "Insufficient Streak" error

You need 7+ consecutive days before withdrawal.

### "Habit Not Found" error

You're using an invalid habit ID. Check your habit IDs with \`get-user-habits\`.

### Contract not responding

Check Stacks network status:
- https://status.hiro.so
- https://explorer.hiro.so

## Safety and Security

### Is my stake safe?

Your stake is held securely by the smart contract. No one (including the developer) can access it except through the defined contract functions.

### What if I lose my wallet?

If you lose access to your wallet (seed phrase), you lose access to your stakes. **Always backup your seed phrase securely.**

### Can someone steal my habits?

No. Only you (the owner) can check in or withdraw from your habits.

### Is there an admin key?

No. The contract has no admin functions. It's completely decentralized.

## Still Have Questions?

- **GitHub Issues:** https://github.com/Yusufolosun/AhhbitTracker/issues
- **Documentation:** https://github.com/Yusufolosun/AhhbitTracker/tree/main/docs
- **Contract Explorer:** https://explorer.hiro.so/txid/SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker?chain=mainnet
