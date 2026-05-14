# Core Service Layer

The core service layer in the AhhbitTracker mobile app provides the foundational logic for interacting with external systems, primarily the Stacks blockchain and the Hiro API.

## Design Philosophy

Services are designed to be:
- **Stateless**: They do not hold internal state; instead, they provide methods to fetch or transform data.
- **Async-First**: All blockchain and network operations are asynchronous.
- **Type-Safe**: Input and output types are strictly defined to match contract interfaces.

## Key Services

### `src/services/contractService.ts`

The primary interface for interacting with the AhhbitTracker smart contracts. It handles:
- Fetching habit details by ID.
- Querying user-specific habit lists.
- Retrieving global pool state.
- Parsing Clarinet-style response values into JavaScript objects.

### `src/services/networkService.ts`

Manages the Stacks network configuration based on environment variables. It provides the `StacksNetwork` instance used by all blockchain transactions.

### `src/services/storageService.ts`

A wrapper around `@react-native-async-storage/async-storage` for persisting user preferences, tracked addresses, and notification settings.

## Blockchain Network Integration

The app dynamically selects the network based on the `EXPO_PUBLIC_STACKS_NETWORK` environment variable.

### Network Selection Logic

```typescript
const network = EXPO_PUBLIC_STACKS_NETWORK === 'mainnet' 
  ? new StacksMainnet() 
  : new StacksTestnet({ url: EXPO_PUBLIC_HIRO_API_BASE_URL });
```

### Hiro API Usage

The Hiro API is used for:
- Fetching account balances.
- Retrieving transaction status and history.
- Polking for new block height to determine check-in windows.
