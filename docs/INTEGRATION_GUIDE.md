# Integration Guide

Guide for developers integrating AhhbitTracker into applications.

## Overview

This guide covers:
- Web application integration
- Wallet connection
- Transaction handling
- Data fetching
- Error handling

---

## Prerequisites

### Required Packages

```bash
npm install @stacks/connect @stacks/transactions @stacks/network
```

### TypeScript Setup

```typescript
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import { 
  uintCV, 
  stringUtf8CV, 
  principalCV,
  callReadOnlyFunction,
  contractPrincipalCV
} from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';
```

---

## Configuration

### Network Setup

```typescript
const network = new StacksMainnet();

const CONTRACT_ADDRESS = 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193';
const CONTRACT_NAME = 'habit-tracker';
```

### Wallet Configuration

```typescript
const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
```

---

## Wallet Connection

### Connect Wallet

```typescript
function connectWallet() {
  showConnect({
    appDetails: {
      name: 'AhhbitTracker',
      icon: window.location.origin + '/logo.png',
    },
    redirectTo: '/',
    onFinish: () => {
      window.location.reload();
    },
    userSession,
  });
}
```

### Check Authentication

```typescript
function isAuthenticated(): boolean {
  return userSession.isUserSignedIn();
}

function getUserAddress(): string | null {
  if (!userSession.isUserSignedIn()) return null;
  const userData = userSession.loadUserData();
  return userData.profile.stxAddress.mainnet;
}
```

---

## Writing Transactions

### Create Habit

```typescript
import { openContractCall } from '@stacks/connect';

async function createHabit(name: string, stakeAmount: number) {
  const functionArgs = [
    stringUtf8CV(name),
    uintCV(stakeAmount)
  ];

  const options = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'create-habit',
    functionArgs,
    network,
    appDetails: {
      name: 'AhhbitTracker',
      icon: window.location.origin + '/logo.png',
    },
    onFinish: (data: any) => {
      console.log('Transaction ID:', data.txId);
      // Poll for confirmation
      pollTransaction(data.txId);
    },
    onCancel: () => {
      console.log('Transaction canceled');
    },
  };

  await openContractCall(options);
}
```

### Check In

```typescript
async function checkIn(habitId: number) {
  const functionArgs = [uintCV(habitId)];

  const options = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'check-in',
    functionArgs,
    network,
    onFinish: (data: any) => {
      console.log('Check-in successful:', data.txId);
    },
  };

  await openContractCall(options);
}
```

### Withdraw Stake

```typescript
async function withdrawStake(habitId: number) {
  const functionArgs = [uintCV(habitId)];

  const options = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'withdraw-stake',
    functionArgs,
    network,
    onFinish: (data: any) => {
      console.log('Withdrawal successful:', data.txId);
    },
  };

  await openContractCall(options);
}
```

---

## Reading Data

### Get Habit Details

```typescript
async function getHabit(habitId: number) {
  const result = await callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'get-habit',
    functionArgs: [uintCV(habitId)],
    network,
    senderAddress: CONTRACT_ADDRESS,
  });

  return result;
}
```

### Get User Habits

```typescript
async function getUserHabits(userAddress: string) {
  const result = await callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'get-user-habits',
    functionArgs: [principalCV(userAddress)],
    network,
    senderAddress: CONTRACT_ADDRESS,
  });

  return result;
}
```

### Get Pool Balance

```typescript
async function getPoolBalance() {
  const result = await callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'get-forfeited-pool-balance',
    functionArgs: [],
    network,
    senderAddress: CONTRACT_ADDRESS,
  });

  return result;
}
```

---

## Transaction Monitoring

### Poll for Confirmation

```typescript
async function pollTransaction(txId: string): Promise<void> {
  const url = `${network.coreApiUrl}/extended/v1/tx/${txId}`;
  
  const poll = async () => {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.tx_status === 'success') {
      console.log('Transaction confirmed!');
      return true;
    } else if (data.tx_status === 'abort_by_response' || 
               data.tx_status === 'abort_by_post_condition') {
      console.error('Transaction failed');
      return true;
    }
    
    return false;
  };

  // Poll every 10 seconds for up to 5 minutes
  for (let i = 0; i < 30; i++) {
    const done = await poll();
    if (done) break;
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
}
```

---

## Data Parsing

### Parse Habit Data

```typescript
import { cvToJSON } from '@stacks/transactions';

function parseHabitData(clarityValue: any) {
  const json = cvToJSON(clarityValue);
  
  if (json.type === 'none') return null;
  
  const data = json.value.value;
  
  return {
    owner: data.owner.value,
    name: data.name.value,
    stakeAmount: parseInt(data['stake-amount'].value),
    currentStreak: parseInt(data['current-streak'].value),
    lastCheckInBlock: parseInt(data['last-check-in-block'].value),
    createdAtBlock: parseInt(data['created-at-block'].value),
    isActive: data['is-active'].value,
    isCompleted: data['is-completed'].value,
  };
}
```

### Parse User Habits

```typescript
function parseUserHabits(clarityValue: any) {
  const json = cvToJSON(clarityValue);
  
  if (json.type === 'none') return [];
  
  const habitIds = json.value.value['habit-ids'].value;
  return habitIds.map((id: any) => parseInt(id.value));
}
```

---

## Error Handling

### Handle Transaction Errors

```typescript
function handleContractError(errorCode: number): string {
  const errors: { [key: number]: string } = {
    100: 'Not authorized',
    101: 'Stake amount too low (minimum 0.1 STX)',
    102: 'Invalid habit name (max 50 characters)',
    103: 'Habit not found',
    104: 'You do not own this habit',
    105: 'Already checked in today',
    106: 'Check-in window expired - stake forfeited',
    107: 'Need 7+ consecutive days to withdraw',
    108: 'Habit already completed',
    109: 'Insufficient pool balance',
    110: 'Transfer failed',
  };

  return errors[errorCode] || 'Unknown error';
}
```

### Validate Before Submission

```typescript
function validateCreateHabit(name: string, stake: number): string | null {
  if (!name || name.length === 0) {
    return 'Habit name cannot be empty';
  }
  if (name.length > 50) {
    return 'Habit name too long (max 50 characters)';
  }
  if (stake < 100000) {
    return 'Minimum stake is 0.1 STX';
  }
  return null;
}
```

---

## React Hooks Example

### useWallet Hook

```typescript
import { useState, useEffect } from 'react';

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      setAddress(userData.profile.stxAddress.mainnet);
      setIsConnected(true);
    }
  }, []);

  const connect = () => {
    connectWallet();
  };

  const disconnect = () => {
    userSession.signUserOut();
    setAddress(null);
    setIsConnected(false);
  };

  return { address, isConnected, connect, disconnect };
}
```

### useHabits Hook

```typescript
export function useHabits(userAddress: string | null) {
  const [habits, setHabits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userAddress) {
      setHabits([]);
      setLoading(false);
      return;
    }

    async function fetchHabits() {
      setLoading(true);
      const habitIds = await getUserHabits(userAddress);
      
      const habitData = await Promise.all(
        habitIds.map((id: number) => getHabit(id))
      );
      
      setHabits(habitData.filter(h => h !== null));
      setLoading(false);
    }

    fetchHabits();
  }, [userAddress]);

  return { habits, loading };
}
```

---

## Best Practices

### Client-Side Validation

Always validate before submitting transactions:

```typescript
// Check wallet connection
if (!isAuthenticated()) {
  alert('Please connect your wallet');
  return;
}

// Validate inputs
const error = validateCreateHabit(name, stake);
if (error) {
  alert(error);
  return;
}

// Check balance
const balance = await getBalance(userAddress);
if (balance < stake + 200000) { // stake + estimated fee
  alert('Insufficient balance');
  return;
}
```

### Caching Strategy

Cache read-only data to reduce API calls:

```typescript
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 60000; // 1 minute

async function getCachedHabit(habitId: number) {
  const key = `habit-${habitId}`;
  const cached = cache.get(key);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await getHabit(habitId);
  cache.set(key, { data, timestamp: Date.now() });
  return data;
}
```

### User Feedback

Provide clear feedback during transactions:

```typescript
function showTransactionPending(txId: string) {
  toast.info(
    `Transaction submitted. View on Explorer: 
    https://explorer.hiro.so/txid/${txId}?chain=mainnet`
  );
}

function showTransactionSuccess() {
  toast.success('Transaction confirmed!');
  // Refresh data
  refetchHabits();
}
```

---

## Testing

### Test on Devnet First

```typescript
import { StacksDevnet } from '@stacks/network';

const testNetwork = new StacksDevnet();

// Deploy test contract
// Run integration tests
// Verify all functions work
```

### Unit Test Example

```typescript
describe('Habit Creation', () => {
  it('validates habit name', () => {
    expect(validateCreateHabit('', 100000)).toBeTruthy();
    expect(validateCreateHabit('a'.repeat(51), 100000)).toBeTruthy();
    expect(validateCreateHabit('Valid Name', 100000)).toBeNull();
  });

  it('validates stake amount', () => {
    expect(validateCreateHabit('Test', 50000)).toBeTruthy();
    expect(validateCreateHabit('Test', 100000)).toBeNull();
  });
});
```

---

## Complete Example

```typescript
// components/HabitTracker.tsx
import { useWallet } from './hooks/useWallet';
import { useHabits } from './hooks/useHabits';

export function HabitTracker() {
  const { address, isConnected, connect } = useWallet();
  const { habits, loading } = useHabits(address);

  async function handleCreateHabit(name: string, stake: number) {
    const error = validateCreateHabit(name, stake);
    if (error) {
      alert(error);
      return;
    }
    
    await createHabit(name, stake);
  }

  if (!isConnected) {
    return <button onClick={connect}>Connect Wallet</button>;
  }

  if (loading) {
    return <div>Loading habits...</div>;
  }

  return (
    <div>
      <h1>My Habits</h1>
      {habits.map(habit => (
        <HabitCard key={habit.id} habit={habit} />
      ))}
      <CreateHabitForm onSubmit={handleCreateHabit} />
    </div>
  );
}
```

---

## Resources

- **Stacks.js Docs:** https://docs.stacks.co/stacks.js
- **Stacks Connect:** https://github.com/hirosystems/connect
- **Contract Explorer:** https://explorer.hiro.so/txid/SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193.habit-tracker?chain=mainnet
- **Example App:** [Coming Soon]
