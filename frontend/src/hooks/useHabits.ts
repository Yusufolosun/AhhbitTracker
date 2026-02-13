import { useState, useEffect } from 'react';
import { callReadOnlyFunction, principalCV } from '@stacks/transactions';
import { StacksMainnet } from '@stacks/network';

const NETWORK = new StacksMainnet();
const CONTRACT_ADDRESS = 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193';
const CONTRACT_NAME = 'habit-tracker';

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
      try {
        const result = await callReadOnlyFunction({
          contractAddress: CONTRACT_ADDRESS,
          contractName: CONTRACT_NAME,
          functionName: 'get-user-habits',
          functionArgs: [principalCV(userAddress)],
          network: NETWORK,
          senderAddress: CONTRACT_ADDRESS,
        });

        // Parse and set habits
        setHabits([]);
      } catch (error) {
        console.error('Failed to fetch habits:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchHabits();
  }, [userAddress]);

  return { habits, loading };
}
