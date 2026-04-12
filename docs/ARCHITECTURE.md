# AhhbitTracker Architecture

## System Overview

AhhbitTracker is a decentralized habit tracking application built on the Stacks blockchain. The system uses financial commitment (staking STX) to incentivize habit consistency through daily on-chain check-ins.

## Architecture Layers
```
┌─────────────────────────────────────────┐
│         Frontend (React + Vite)         │
│  - Wallet Connection (@stacks/connect)  │
│  - Transaction submission + UI state    │
│  - UI/UX Components                     │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  Shared Contract Abstraction (SDK)      │
│  - Typed transaction builders            │
│  - Shared read-only query executor       │
│  - Retry/timeout + normalized errors     │
│  - Shared Clarity response parsers       │
└──────────────┬──────────────────────────┘
               │
               │ Reused by frontend, mobile, scripts
               │
               │ JSON-RPC / API Calls
               │
┌──────────────▼──────────────────────────┐
│        Stacks Blockchain Layer          │
│  - habit-tracker-v2.clar (Smart Contract)  │
│  - STX Token Transfers                  │
│  - Block-based Timing                   │
└──────────────┬──────────────────────────┘
               │
               │ State Storage
               │
┌──────────────▼──────────────────────────┐
│         Blockchain State                │
│  - habits map                           │
│  - user-habits map                      │
│  - forfeited-pool-balance               │
└─────────────────────────────────────────┘
```

## Shared Contract Interaction Layer

The repository now routes contract reads through a shared abstraction centered in `@yusufolosun/ahhbit-tracker-sdk` (maintained in a dedicated repository):

- `queryReadOnly` and `queryReadOnlyJson` centralize read-only invocation behavior.
- `query-timeout` and `query-retry` enforce consistent timeout and backoff defaults.
- `query-error` normalizes retriable vs non-retriable contract/network failures.
- `parsers` provides reusable Clarity JSON parsing for habits, user stats, and numeric responses.
- `network` exposes `createStacksNetwork` for consistent mainnet/testnet client creation.

Adoption points:

- Frontend service layer delegates write payload construction and typed reads to SDK exports.
- Mobile service layer uses the shared SDK network factory and typed SDK reads.
- Scripts use a shared read-only client module (`scripts/shared/contract-readonly.ts`) to avoid one-off parsing and endpoint handling.

## Smart Contract Architecture

### Core Logic Flow

#### 1. Habit Creation
```
User → create-habit(name, stake) → Contract
  ├─ Validate stake ≥ MIN-STAKE-AMOUNT
  ├─ Validate name length ≤ MAX-HABIT-NAME-LENGTH
  ├─ Transfer stake from user to contract
  ├─ Generate unique habit-id
  ├─ Store habit in habits map
  └─ Add habit-id to user-habits map
```

#### 2. Daily Check-in
```
User → check-in(habit-id) → Contract
  ├─ Verify habit exists
  ├─ Verify caller is owner
  ├─ Calculate blocks since last check-in
  ├─ Require blocks elapsed ≥ MIN-CHECK-IN-INTERVAL (120)
  ├─ If > CHECK-IN-WINDOW blocks:
  │   ├─ Mark streak as broken
  │   ├─ Forfeit stake to pool
  │   └─ Reset habit
  ├─ If ≤ CHECK-IN-WINDOW blocks:
  │   ├─ Increment streak counter
  │   └─ Update last-check-in-block
  └─ Emit check-in event
```

#### 3. Stake Withdrawal
```
User → withdraw-stake(habit-id) → Contract
  ├─ Verify habit exists
  ├─ Verify caller is owner
  ├─ Verify streak ≥ MIN-STREAK-FOR-WITHDRAWAL
  ├─ Transfer stake back to user
  ├─ Mark habit as completed
  └─ Emit withdrawal event
```

#### 4. Bonus Claim
```
User → claim-bonus(habit-id) → Contract
  ├─ Verify user has completed habits
  ├─ Calculate user's share of pool
  ├─ Transfer bonus from pool to user
  ├─ Update pool balance
  └─ Emit claim event
```

## Data Model

### Habits Map
```clarity
{
  habit-id: uint → {
    owner: principal,
    name: (string-utf8 50),
    stake-amount: uint,
    current-streak: uint,
    last-check-in-block: uint,
    created-at-block: uint,
    is-active: bool,
    is-completed: bool,
    bonus-claimed: bool
  }
}
```

**Indexes:**
- Primary: `habit-id` (auto-incrementing)
- Secondary: `owner` (via user-habits map)

### User-Habits Map
```clarity
{
  user: principal → {
    habit-ids: (list 100 uint)
  }
}
```

**Purpose:** Enables efficient querying of all habits for a given user

## Time-based Logic

Stacks produces blocks approximately every **10 minutes**.

- **24 hours** ≈ 144 blocks
- **7 days** ≈ 1,008 blocks
- **30 days** ≈ 4,320 blocks

**Check-in validation:**
```
current-block-height - last-check-in-block ≥ MIN-CHECK-IN-INTERVAL (120 blocks)
current-block-height - last-check-in-block ≤ CHECK-IN-WINDOW (144 blocks)
```

If user checks in after 144 blocks from last check-in, streak is broken and stake forfeited.

## Fee Structure

### Transaction Costs (Estimated)

| Action | Function | Estimated Fee |
|--------|----------|---------------|
| Create Habit | `create-habit` | ~0.15-0.25 STX |
| Daily Check-in | `check-in` | ~0.10-0.20 STX |
| Withdraw Stake | `withdraw-stake` | ~0.15-0.25 STX |
| Claim Bonus | `claim-bonus` | ~0.15-0.25 STX |

**Total monthly cost per habit:**
- 30 check-ins × 0.15 STX = **4.5 STX**
- Plus creation + withdrawal = **~5 STX/month**

### Stake Economics

**Example scenario:**
- 100 users create habits with 1 STX stakes
- 70 users maintain streaks
- 30 users miss check-ins

**Forfeited pool:** 30 STX
**Per successful user bonus:** 30 STX ÷ 70 = **~0.43 STX**

**ROI for successful user:**
- Stake recovered: 1 STX
- Bonus earned: 0.43 STX
- Total: **1.43 STX** (43% return)

## Frontend Architecture

### Component Structure
```
src/
├── App.tsx                    # Root with providers and routing
├── components/
│   ├── ConfirmationDialog.tsx # Modal for destructive actions
│   ├── Dashboard.tsx          # User statistics overview
│   ├── ErrorBoundary.tsx      # Error catching component
│   ├── Footer.tsx             # Site footer with links
│   ├── HabitCard.tsx          # Individual habit with check-in/withdraw/claim
│   ├── HabitForm.tsx          # Create new habit form
│   ├── HabitList.tsx          # Display and filter habits by status
│   ├── Header.tsx             # Navigation and wallet display
│   ├── LoadingSpinner.tsx     # Loading indicator
│   ├── PoolDisplay.tsx        # Forfeited pool balance
│   ├── RateLimitBanner.tsx    # API rate limit warning
│   ├── Skeletons.tsx          # Loading placeholders
│   ├── StatsCard.tsx          # Statistics display card
│   ├── ThemeToggle.tsx        # Dark/light mode toggle
│   ├── Toast.tsx              # Notification component
│   ├── ToastContainer.tsx     # Toast display layer
│   ├── TransactionTracker.tsx # Pending transaction display
│   └── WalletConnect.tsx      # Wallet connection screen
├── context/
│   ├── ThemeContext.tsx       # Dark/light theme state
│   ├── ToastContext.tsx       # Notification state management
│   ├── TransactionContext.tsx # Pending transaction tracking
│   └── WalletContext.tsx      # Wallet connection state
├── hooks/
│   ├── useCurrentBlock.ts     # Current block height polling
│   ├── useHabits.ts           # Habits data, stats, and mutations
│   ├── useHashParam.ts        # URL hash parameter state
│   └── useHashRoute.ts        # Hash-based SPA routing
├── services/
│   ├── contractService.ts     # Smart contract interactions
│   └── walletService.ts       # Wallet connection logic
├── styles/
│   └── global.css             # Tailwind layers and custom styles
├── types/
│   └── habit.ts               # TypeScript interfaces
└── utils/
    ├── constants.ts           # Network and contract configuration
    ├── formatting.ts          # Value formatting (STX, blocks, time)
    ├── habitStatus.ts         # Check-in window state calculations
    └── validation.ts          # Input validation functions
```

### State Management

**Server State:** React Query (@tanstack/react-query)
- Handles caching, refetching, and optimistic updates
- 2-minute polling interval for habits
- 5-minute cache for pool balance

**UI State:** React Context API
- WalletContext: Connection and balance
- TransactionContext: Pending transaction tracking
- ToastContext: Notifications
- ThemeContext: Dark/light mode

**Mobile App State:** Reducer + Context selectors
- AppStateProvider: Tracks address hydration and transaction preview payloads
- AsyncStorage persistence: Restores tracked address at startup with address validation
- React Query boundary: Address transitions prune and invalidate user-scoped cache keys

**URL State:** Hash-based routing
- useHashRoute for page navigation
- useHashParam for filter state (e.g., active tab)

### Transaction Flow
```
User Action (Click) → 
  Component Handler → 
    Build Transaction (@stacks/transactions) → 
      Sign with Wallet (@stacks/connect) → 
        Broadcast to Network → 
          Poll for Confirmation → 
            Update UI
```

## Security Model

### Contract Security

1. **No Admin Privileges:** No functions allow contract owner to withdraw user stakes
2. **Immutable Logic:** Contract cannot be upgraded after deployment
3. **Deterministic Timing:** Block-based timing prevents manipulation
4. **Built-in STX Transfers:** Uses Clarity's secure `stx-transfer?`

### Frontend Security

1. **No Private Key Handling:** All signing via external wallets
2. **Transaction Preview:** Users see full transaction before signing
3. **Amount Validation:** Frontend validates stake amounts before building tx
4. **Read-Only Defaults:** Contract reads don't require wallet connection

## Scalability Considerations

### On-Chain Limits

- **Max habits per user:** 100 (list size in user-habits map)
- **Max concurrent users:** Unlimited (no global constraints)
- **Storage per habit:** ~200 bytes

### Performance Optimizations

1. **Code Splitting:** Route-level lazy loading with React.lazy()
2. **React Query Caching:** 2-minute stale time reduces API calls
3. **Optimistic Updates:** UI updates immediately, reverts on error
4. **Skeleton Loading:** Layout-stable loading states prevent CLS
5. **Memoization:** useMemo for expensive calculations (Dashboard stats)

## Deployment Strategy

1. **Testnet Deployment:** Validate all functions on testnet
2. **Mainnet Deployment:** Deploy immutable contract to mainnet
3. **Frontend Deployment:** Host on Vercel/Netlify with API calls to Hiro API
4. **Contract Address:** Hard-code in frontend after deployment

## Future Enhancements (Post-MVP)

- Multi-currency support (custom SIP-010 tokens)
- Habit categories and badges
- Social features (share streaks)
- Leaderboards
- Variable check-in windows (weekly, custom intervals)

---

**Version:** 1.0.0
**Last Updated:** 2026-04-09
**Network:** Stacks Mainnet
