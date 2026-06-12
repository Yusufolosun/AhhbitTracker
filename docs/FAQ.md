# Frequently Asked Questions (FAQ)

## About AhhbitTracker

### What is AhhbitTracker?
AhhbitTracker is a habit-building app where you stake a small amount of STX as a commitment to stay consistent. By checking in daily, you build your streak. Completing a 7-day streak allows you to withdraw your deposit plus a community-funded bonus. Missing a day forfeits a portion of your stake to the reward pool.

### Does this require real money?
Yes, it uses STX, which is a real cryptocurrency. However, you can use **Demo Mode** on the website to practice with simulated tokens and mock habits for free.

### Why does it use blockchain instead of a normal server?
Using the Stacks blockchain provides:
1. **Trustless Enforcement**: No company can seize your money or change the rules. Your deposit is held by a smart contract that acts strictly as coded.
2. **Privacy**: No sign-ups, passwords, or personal details are required. Your wallet address is your secure log-in.

---

## Getting Started & Wallets

### What is a Stacks wallet?
A Stacks wallet is a secure application that holds your digital tokens and lets you sign transactions. Think of it as your secure identity card on the blockchain.

### How do I get a Stacks wallet?
You can install Leather or Xverse as a browser extension or mobile app:
* [Xverse Wallet](https://xverse.app)
* [Leather Wallet](https://leather.io)

### How do I get STX tokens?
To use real funds:
1. Buy STX on a reputable exchange (such as Coinbase or Binance).
2. Transfer the STX to your personal Stacks wallet address (a string starting with `SP`).

---

## Habit Mechanics & Timing

### What happens to my habit if I miss just one day?
If you miss the 32-hour check-in window, a 10% penalty is applied to your remaining deposit, and your streak resets to zero. Your stake is not fully lost. You can continue checking in to start a new streak, or finalize the habit to retrieve your remaining balance.

### Can I create multiple habits?
Yes, you can track multiple habits concurrently. Each habit is managed independently with its own stake, streak tracker, and check-in times.

### What is a "Block" and why is it used for time?
The Stacks blockchain updates in blocks approximately every 10 minutes. The app counts time using blocks so that contract rules can be verified on-chain.
* **96 blocks** is approximately **16 hours**.
* **192 blocks** is approximately **32 hours**.

### Why can't I check in immediately after creating a habit?
Your first check-in window starts after your habit is created. You must wait at least 96 blocks (~16 hours) before logging your first check-in. This prevents immediate double-check-ins and ensures real daily spacing.

### What is the check-in window?
* **Cooldown**: Before 16 hours have passed. You cannot check in yet.
* **On Time**: Between 16 and 32 hours after your last check-in. Your streak increases.
* **Late/Missed**: After 32 hours. Your streak resets to zero and a 10% penalty is applied.

---

## Troubleshooting & Errors

### Why is my transaction pending?
Blockchain transactions can take a few minutes to confirm. The dashboard includes a transaction tracker that will update once the Stacks network registers your action.

### Why do I need to pay a transaction fee (gas)?
Every transaction on the blockchain requires fee payments to secure the network. These fees are fractions of a cent in STX and go to network validators, not AhhbitTracker.

### What are the common error codes?
* **ERR-u105 (Already Checked In)**: You are in your cooldown period. Wait until 16 hours have passed since your last check-in.
* **ERR-u107 (Insufficient Streak)**: You are trying to withdraw before completing a 7-day streak.
* **ERR-u101 (Stake Too Low)**: You need to deposit at least 0.02 STX.
