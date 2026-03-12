# AhhbitTracker — Frontend

React + TypeScript dApp for the [AhhbitTracker](../README.md) smart contract on Stacks Mainnet.

## Stack

| | |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Styling | Tailwind CSS 3 |
| State | @tanstack/react-query 5 |
| Wallet | @stacks/connect 7 |
| Deployment | Vercel |

## Getting Started

```bash
# From the frontend/ directory
cp .env.example .env.local   # configure if overriding contract address
npm install
npm run dev                  # → http://localhost:3000
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local dev server on port 3000 |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build locally |
| `npm run lint` | ESLint check |
| `npm run lint:fix` | ESLint auto-fix |
| `npm run format` | Prettier format |

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_CONTRACT_ADDRESS` | `SP1M46W6...` | Contract principal |
| `VITE_CONTRACT_NAME` | `habit-tracker-v2` | Contract name |

See `.env.example` for the full template. Never commit `.env.local`.

## Deploy to Vercel

Set **Root Directory** to `frontend` in your Vercel project settings.  
`vercel.json` in this directory handles SPA rewrites and security headers automatically.

See the [root README Deploy section](../README.md#deploy-to-vercel) for full instructions.

## Project Structure

```
src/
  components/     UI components (Header, Dashboard, HabitForm, etc.)
  context/        React context providers (Wallet, Transaction, Toast, Theme)
  hooks/          Custom hooks (useHabits, useHashRoute, etc.)
  services/       Wallet and Stacks API service layer
  utils/          Constants, formatters, helpers
  styles/         Global CSS
  types/          Shared TypeScript types
```

## Architecture Notes

- **Wallet auth** — `WalletContext` wraps `@stacks/connect` and exposes `walletState` app-wide
- **Contract calls** — `useHabits` hook handles all read/write interactions with the Clarity contract
- **Rate limiting** — `RateLimitBanner` listens for 429 events from `@tanstack/react-query` retry logic
- **Dev proxy** — In development, Vite proxies `/api/stacks/*` to `https://api.mainnet.hiro.so` to avoid CORS
- **Production** — Uses `STACKS_MAINNET` from `@stacks/network` directly (no proxy needed)
