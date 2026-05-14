# Mobile Setup & Development

This guide outlines the prerequisites and steps required to set up the AhhbitTracker mobile development environment.

## Prerequisites

- **Node.js**: Version 18 or higher (LTS recommended).
- **npm**: Standard package manager included with Node.js.
- **Expo CLI**: Installed globally or via `npx`.
- **Expo Go App**: Installed on your physical device for local testing.
- **Android Studio / Xcode**: Optional, for running on emulators/simulators.

## Installation

1.  **Navigate to the mobile directory**:
    ```bash
    cd mobile
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env` file in the `mobile/` directory based on the provided examples.

    ```bash
    cp .env.example .env
    ```

## Environment Variables Configuration

- `EXPO_PUBLIC_CONTRACT_ADDRESS`: The Stacks address where the contracts are deployed.
- `EXPO_PUBLIC_CONTRACT_NAME`: The name of the main habit-tracker contract.
- `EXPO_PUBLIC_HIRO_API_BASE_URL`: The API endpoint for the Stacks network.
- `EXPO_PUBLIC_STACKS_NETWORK`: Either `mainnet`, `testnet`, or `devnet`.

## Development Workflow

### Starting the Development Server

To start the Expo development server:

```bash
npm run start
```

This will open the Expo Dev Tools in your browser and provide a QR code to scan with the Expo Go app.

### Available Scripts

- `npm run android`: Starts the app on a connected Android device or emulator.
- `npm run ios`: Starts the app on a connected iOS device or simulator.
- `npm run web`: Starts a web version of the app (experimental).
- `npm run check`: Runs TypeScript type checks across the project.
- `npm run start:clear`: Starts Expo and clears the cache.

### Connecting to Devnet

If you are developing against a local Stacks devnet (via Clarinet), ensure your mobile device and devnet machine are on the same network, and update `EXPO_PUBLIC_HIRO_API_BASE_URL` to your machine's local IP address.

