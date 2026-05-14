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
