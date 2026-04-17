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
| `VITE_APP_STAGE` | `production` | Stage profile (`development`, `staging`, `production`) |
| `VITE_STACKS_NETWORK` | stage-based | Selects `mainnet` or `testnet` defaults |
| `VITE_STACKS_API_URL` | stage-based | Stacks API base URL used by the dev proxy |
| `VITE_CONTRACT_ADDRESS` | `SP1N3809...` | Contract principal |
| `VITE_CONTRACT_NAME` | `habit-tracker-v2` | Contract name |

Use stage templates for safer setup:

- `.env.development.example`
- `.env.staging.example`
- `.env.production.example`

See `.env.example` for variable descriptions. Never commit `.env.local` or `*.local` stage files.

## Deploy to Vercel

Set **Root Directory** to `frontend` in your Vercel project settings.  
`vercel.json` in this directory handles SPA rewrites and security headers automatically.

See the [root README Deploy section](../README.md#deploy-to-vercel) for full instructions.

## Project Structure

```
src/
  components/     UI components (Header, Dashboard, HabitForm, etc.)
  components/ui/  Shared primitives (SurfaceCard, ActionButton, CalloutCard, etc.)
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
- **UI primitives** — shared card/button/callout/empty-state components live under `src/components/ui` and are used by dashboard, auth, and notification surfaces
- **Dev proxy** — In development, Vite proxies `/api/stacks/*` to `https://api.mainnet.hiro.so` to avoid CORS
- **Production** — Uses `STACKS_MAINNET` from `@stacks/network` directly (no proxy needed)
- **Create habit flow** — The habit form enforces the contract's 0.02-100 STX stake range and 50-character name limit before submitting a `create-habit` call
