# Troubleshooting & Pitfalls

This guide covers common issues encountered during development and usage of the AhhbitTracker mobile app.

## Common Development Issues

### Metro Bundler Not Starting
- **Symptom**: `npm run start` hangs or errors.
- **Solution**: Try clearing the cache with `npm run start:clear`. Ensure no other process is using port 8081.

### "Contract Not Found" Errors
- **Symptom**: App fails to fetch data or build transactions.
- **Solution**: Verify `EXPO_PUBLIC_CONTRACT_ADDRESS` and `EXPO_PUBLIC_CONTRACT_NAME` in your `.env` file match the deployed contracts on your target network.

### Deep Links Not Working in Simulator
- **Symptom**: Wallet handoff or callback fails to redirect.
- **Solution**: Deep links can be flaky in simulators. Test on a physical device using Expo Go for the best results.

## Common Usage Pitfalls

### Check-In Window Invalidation
- **Issue**: Transactions fail with "window-expired".
- **Reason**: Stacks block times can be variable. The app polls for the latest block height, but a block might be mined between preview generation and signing.
- **Advice**: Encourage users to check in early in the window.

### Insufficient STX for Fees
- **Issue**: Wallet reports insufficient funds even if the stake is covered.
- **Reason**: Users must also cover the network transaction fee (typically 0.001 - 0.01 STX).
