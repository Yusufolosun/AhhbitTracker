# Security & Biometrics

Security is paramount when handling blockchain transactions and user data. AhhbitTracker Mobile implements several layers of security to protect the user.

## Biometric Authentication

We use `expo-local-authentication` to gate sensitive actions behind device biometrics (FaceID, TouchID, or Passcode).

### Protected Actions
- **Creating Transaction Previews**: Requires biometrics to confirm the user's intent.
- **Clearing Tracked Address**: Requires biometrics to prevent accidental data loss.
- **Accessing Settings**: Optional biometric gate for advanced settings.

## Data Security

- **Sensitive Data Storage**: We do not store private keys. Public addresses and preferences are stored in `AsyncStorage`.
- **Encrypted Storage**: Critical user metadata is stored using `expo-secure-store` where available.

## Secure Handoffs

All interactions with external wallets are performed via secure deep links. We validate the `callbackUrl` to ensure redirects return only to the authorized application scheme.
