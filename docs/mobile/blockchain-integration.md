# Stacks Blockchain Integration

Integrating with the Stacks blockchain is a core capability of the AhhbitTracker mobile app. We use the official Stacks SDKs to interact with the network and execute smart contract functions.

## SDK Usage

We utilize the following libraries:
- `@stacks/network`: To manage network connectivity (Mainnet/Testnet).
- `@stacks/transactions`: To build transaction payloads and handle Clarity value conversions.
- `@stacks/common`: For shared utilities and address validation.

## Integration Patterns

### 1. Read-Only Function Calls

We use `callReadOnlyFunction` to fetch data from the blockchain without requiring user signing. These calls are wrapped in React Query hooks for efficient caching and revalidation.

```typescript
// Example: Fetching a habit
const response = await callReadOnlyFunction({
  contractAddress,
  contractName,
  functionName: 'get-habit',
  functionArgs: [uintCV(habitId)],
  network,
  senderAddress,
});
```

### 2. Transaction Previews

Before sending a transaction to a wallet, we generate a "Preview" in the app. This allows the user to review:
- The contract function being called.
- The arguments passed (e.g., stake amount, habit name).
- Post-conditions (asset transfers).

### 3. Wallet Handoff

Since the mobile app does not store private keys, it hands off transaction signing to a dedicated Stacks wallet app (like Xverse or Leather) via deep links using the `makeContractCall` helper from `@stacks/transactions`.

## Post-Condition Enforcement

Post-conditions are critical for security in Stacks. The mobile app explicitly defines them for every state-changing transaction.

### Example: Create Habit Post-Condition

When creating a habit, we enforce that the user sends exactly the stake amount in STX to the contract.

```typescript
const postCondition = makeStandardSTXPostCondition(
  senderAddress,
  PostConditionMode.Deny,
  FungibleConditionCode.Equal,
  stakeAmount
);
```

By setting the mode to `Deny`, the transaction will fail on-chain if the contract tries to transfer more STX or other assets from the user than specified.

