# Frequently Asked Questions (FAQ)

## 💡 About AhhbitTracker

### What is AhhbitTracker?
AhhbitTracker is a habit-building app where you put a tiny amount of STX (a digital token) on the line to keep you accountable. Check in daily to build your streak. If you finish your 7-day streak, you get your money back plus a bonus! If you miss a day, you lose a tiny portion to the bonus pool.

### Does this require real money?
Yes, it uses STX, which is a real cryptocurrency. However, you can use our **Interactive Demo Mode** (Sandbox) on the website to practice with simulated tokens and mock habits for free!

### Why does it use blockchain instead of a normal server?
Using the Stacks blockchain means:
1.  **Trustless Enforcement**: No company can take your money or change the rules. Your deposit is held by an automated program (smart contract) that acts exactly as coded.
2.  **No Sign-ups**: You don't need to share your email, phone number, or password. Your wallet address is your secure log-in.

---

## 🔑 Getting Started & Wallets

### What is a Stacks wallet?
A Stacks wallet is a secure application that holds your digital tokens and lets you interact with the app. Think of it as a secure login card.

### How do I get a Stacks wallet?
You can install Leather or Xverse as a browser extension (desktop) or mobile app:
*   [Download Xverse Wallet](https://xverse.app)
*   [Download Leather Wallet](https://leather.io)

### How do I get STX tokens?
If you are ready to use real funds:
1.  Buy STX on an exchange (like Coinbase, Binance, or local P2P platforms).
2.  Withdraw the STX to your personal Stacks wallet address (which looks like a long string of letters and numbers starting with `SP`).

---

## ⏱️ Habit Mechanics & Block Times

### What is a "Block" and why does the app use it for time?
The Stacks blockchain updates in chunks called "blocks" (secured by Bitcoin) approximately every 10 minutes. The app counts time using blocks instead of traditional hours so that the contract rules can be checked fairly on-chain.
*   **96 blocks** is about **16 hours**.
*   **192 blocks** is about **32 hours**.

### Why can't I check in immediately after creating a habit?
To prevent cheating, your first check-in window starts **after** your habit is created. You must wait at least 96 blocks (~16 hours) before you can log your first check-in. If you try earlier, you will see a "Check In Not Ready" warning.

### What is the check-in window?
After your last check-in, you have a window between **16 hours and 32 hours** to check in again.
*   If you check in too early (before 16 hours), you are in **cooldown** and can't check in yet.
*   If you check in on time (between 16 and 32 hours), your streak increases.
*   If you miss the window (after 32 hours), your streak resets to zero and a **10% penalty** is applied.

---

## 🛠️ Fees & Troubleshooting

### Why is my transaction pending?
Blockchain transactions can take a few minutes to confirm. The dashboard includes a transaction tracker that will update once the Stacks network registers your action.

### Why do I need to pay a transaction fee (gas)?
Every update on the blockchain requires transaction fees to pay the network validators who secure the blockchain. These fees are very low (usually fractions of a cent in STX) and do not go to the app creators.

### What are the common error codes?
If a transaction fails, you might see one of these codes:
*   **ERR-u105 (Already Checked In)**: You are trying to check in during your cooldown period. Wait until 16 hours have passed since your last check-in.
*   **ERR-u107 (Insufficient Streak)**: You are trying to withdraw before completing a 7-day streak.
*   **ERR-u101 (Stake Too Low)**: You need to deposit at least 0.02 STX.
