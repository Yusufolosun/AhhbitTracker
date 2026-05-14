# Transaction Lifecycle

The transaction lifecycle in AhhbitTracker Mobile is designed to provide transparency and security, ensuring users are fully aware of what they are signing.

## Lifecycle Stages

### 1. Intent & Payload Generation
When a user initiates an action (e.g., "Create Habit"), the app builds a transaction payload. This includes the function name, arguments, and required post-conditions.

### 2. Preview & Validation
The payload is passed to the `TransactionPreview` screen. Here, the app validates:
- **Stake Range**: Ensures the stake is within the contract's 0.02 - 100 STX limits.
- **Timing**: Validates that check-ins are performed within the valid block window (96-192 blocks).
- **Network**: Confirms the app is connected to the correct network.

### 3. Wallet Handoff
The app generates a signing request and launches the external wallet via a deep link.

### 4. Callback Processing
Once the user signs or cancels in the wallet, the wallet redirects back to AhhbitTracker via a deep link. The app parses the `txId` and status to provide immediate feedback.

### 5. Confirmation Polling
For successful handoffs, the app polls the Hiro API for the transaction status until it is either `anchored` or `failed`.

## Security Considerations

- **No Private Keys**: The app never asks for or stores the user's secret recovery phrase.
- **Post-Conditions**: Every transaction includes post-conditions to prevent malicious contract behavior from draining funds.

## Wallet Handoff Implementation

We use `openURL` from `expo-linking` to send the payload to the wallet.

```typescript
const url = `https://app.xverse.app/transactions?payload=${serializedPayload}&callback=${callbackUrl}`;
await Linking.openURL(url);
```

## Callback Parsing

The `AppRoot` navigation container listens for deep links and extracts transaction results:

```typescript
const handleDeepLink = (url: string) => {
  const { queryParams } = Linking.parse(url);
  if (queryParams?.txId) {
    // Navigate to transaction success screen
  }
};
```

