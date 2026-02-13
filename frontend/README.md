# AhhbitTracker Frontend

Modern React frontend for the AhhbitTracker habit tracking dApp on Stacks blockchain.

## 🚀 Quick Start

```bash
cd frontend
npm install
npm run dev
```

Opens at **http://localhost:3000**

## 📦 Build

```bash
npm run build
```

Production build outputs to `dist/`

## ✨ Features

### Core Functionality
- 🔐 **Wallet Connection** - Seamless integration with Leather, Xverse, and Asigna wallets
- ➕ **Habit Creation** - Create habits with customizable STX stakes (minimum 0.1 STX)
- 📋 **Habit Management** - View all habits (active, completed, forfeited)
- ✅ **Daily Check-ins** - One-click check-in with transaction confirmation
- 📈 **Streak Tracking** - Visual progress bars and streak counters
- 💰 **Stake Withdrawal** - Withdraw stakes after 7-day completion
- 🎁 **Bonus Claims** - Claim rewards from forfeited stake pool
- 📊 **Real-time Dashboard** - Live statistics and analytics

### User Experience
- ⚡ **Fast Updates** - Smart cache invalidation with React Query
- 🔄 **Auto-refresh** - Automatic data refresh after blockchain confirmation
- 💬 **User Feedback** - Success/error messages for all actions
- 🎨 **Responsive Design** - Mobile-first Tailwind CSS styling
- 🌐 **Block Explorer Links** - Direct links to transaction details

## 🛠️ Tech Stack

### Core Technologies
- **React** 18.2.0 - Modern hooks-based architecture
- **TypeScript** 5.9.3 - Full type safety
- **Vite** 4.5.14 - Lightning-fast HMR development
- **Tailwind CSS** 3.4.0 - Utility-first styling

### Stacks Integration
- **@stacks/connect** 7.0.0 - Wallet authentication
- **@stacks/transactions** 6.18.0 - Transaction signing and post-conditions
- **@stacks/network** 6.18.0 - Network configuration

### State Management
- **@tanstack/react-query** 5.62.11 - Server state synchronization
- **React Context** - Global wallet state management

### Development
- **Vitest** 2.1.8 - Unit testing
- **@testing-library/react** 16.1.0 - Component testing
- **ESLint** - Code quality
- **TypeScript ESLint** - Type-aware linting

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/        # React components
│   │   ├── Dashboard.tsx       # Statistics dashboard
│   │   ├── HabitForm.tsx       # Create habit form
│   │   ├── HabitCard.tsx       # Individual habit display
│   │   ├── HabitList.tsx       # Habit list with filters
│   │   ├── Header.tsx          # App header with wallet
│   │   ├── WalletConnect.tsx   # Wallet connection button
│   │   ├── StatsCard.tsx       # Reusable stat display
│   │   └── PoolDisplay.tsx     # Forfeited pool info
│   ├── context/          # React Context providers
│   │   └── WalletContext.tsx   # Global wallet state
│   ├── hooks/            # Custom React hooks
│   │   └── useHabits.ts        # React Query data hooks
│   ├── services/         # API/blockchain services
│   │   ├── contractService.ts  # Smart contract calls
│   │   └── walletService.ts    # Wallet operations
│   ├── types/            # TypeScript definitions
│   │   └── habit.ts            # Habit interfaces
│   ├── utils/            # Utility functions
│   │   ├── constants.ts        # App constants
│   │   ├── formatting.ts       # Data formatters
│   │   └── validation.ts       # Input validators
│   ├── styles/           # Global styles
│   │   └── global.css          # Tailwind directives
│   ├── App.tsx           # Root component
│   └── main.tsx          # Entry point
├── public/               # Static assets
├── package.json          # Dependencies
├── vite.config.ts        # Vite configuration
├── tailwind.config.js    # Tailwind configuration
└── tsconfig.json         # TypeScript configuration
```

## ⚙️ Configuration

### Contract Address

Update `src/utils/constants.ts` with your deployed contract:

```typescript
export const CONTRACT_ADDRESS = 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193';
export const CONTRACT_NAME = 'habit-tracker';
```

### Network

Switch between testnet/mainnet in `src/utils/constants.ts`:

```typescript
import { StacksMainnet, StacksTestnet } from '@stacks/network';

export const NETWORK = new StacksMainnet(); // or StacksTestnet()
```

### Vite Dev Server

Port configuration in `vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    port: 3000,
  },
});
```

## 🔐 Security Implementation

### Transaction Post-Conditions

All STX transfers are protected with post-conditions:

```typescript
// Example: Create habit with stake
const postConditions = [
  makeStandardSTXPostCondition(
    userAddress,
    FungibleConditionCode.Equal,
    stakeAmount
  ),
];
```

### Transaction Confirmation

Smart retry logic ensures UI updates after blockchain confirmation:

```typescript
onSuccess: () => {
  // Immediate invalidation
  queryClient.invalidateQueries(['habits', address]);
  
  // Delayed retry (5s) for blockchain sync
  setTimeout(() => {
    queryClient.invalidateQueries(['habits', address]);
  }, 5000);
}
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🎨 Styling

### Tailwind CSS

Custom configuration in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#6366f1',
        600: '#4f46e5',
      },
    },
  },
}
```

### Component Classes

Utility classes defined in `src/styles/global.css`:

```css
.btn-primary {
  @apply bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg;
}
```

## 📊 State Management

### React Query Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,      // 30 seconds
      refetchOnWindowFocus: false,
    },
  },
});
```

### Query Keys

Consistent key structure for cache invalidation:

- `['habits', walletAddress]` - User's habit list
- `['userStats', walletAddress]` - User statistics
- `['poolBalance']` - Forfeited pool balance

## 🐛 Troubleshooting

### Common Issues

**Wallet not connecting:**
- Ensure wallet extension is installed and unlocked
- Try refreshing the page
- Check browser console for errors

**Transactions failing:**
- Verify sufficient STX balance (stake + fees)
- Check post-condition requirements
- Confirm wallet is on correct network (mainnet/testnet)

**Data not updating:**
- Wait 10 seconds for blockchain confirmation
- Manually refresh if needed
- Check console for query invalidation logs

### Debug Mode

Enable console logging in `useHabits.ts`:

```typescript
console.log('getUserHabits result:', result);
console.log('Habit IDs:', habitIds);
console.log('Fetched habits:', habitsData);
```

## 🚀 Deployment

### Build Optimization

```bash
# Production build with optimizations
npm run build

# Preview production build locally
npm run preview
```

### Environment Variables

Create `.env.production`:

```env
VITE_CONTRACT_ADDRESS=SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193
VITE_NETWORK=mainnet
```

### Deploy Options

- **Vercel:** `vercel --prod`
- **Netlify:** `netlify deploy --prod`
- **GitHub Pages:** Configure in repository settings
- **IPFS:** Use Fleek or Pinata for decentralized hosting

## 📝 License

MIT License - see [LICENSE](../LICENSE) for details

---

**Built with ❤️ on Stacks blockchain**
