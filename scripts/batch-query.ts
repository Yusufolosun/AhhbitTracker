import { createContractReadonlyClient } from './shared/contract-readonly';

const CONTRACT_ADDRESS = 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z';
const CONTRACT_NAME = 'habit-tracker-v2';
const NETWORK_API = 'https://api.mainnet.hiro.so';

const client = createContractReadonlyClient({
  contractAddress: CONTRACT_ADDRESS,
  contractName: CONTRACT_NAME,
  mode: 'mainnet',
  baseUrl: NETWORK_API,
});

async function batchQueryHabits(habitIds: number[]) {
  console.log(`Querying ${habitIds.length} habits...`);
  console.log();

  const results = await Promise.all(
    habitIds.map(async (id) => {
      try {
        const habit = await client.getHabit(id);
        if (!habit) {
          return null;
        }

        return {
          id,
          name: habit.name,
          owner: habit.owner,
          stakeAmount: habit.stakeAmount,
          currentStreak: habit.currentStreak,
          isActive: habit.isActive,
          exists: true
        };
      } catch (error) {
        console.error(`Error querying habit ${id}:`, error);
        return null;
      }
    })
  );

  const validHabits = results.filter((h) => h !== null);

  console.log("Habit Query Results:");
  console.log("=".repeat(60));
  
  if (validHabits.length === 0) {
    console.log("No valid habits found.");
  } else {
    validHabits.forEach((habit: any) => {
      console.log(`Habit #${habit.id}:`);
      console.log(`  Name: ${habit.name}`);
      console.log(`  Owner: ${habit.owner}`);
      console.log(`  Stake: ${habit.stakeAmount} microSTX`);
      console.log(`  Current Streak: ${habit.currentStreak}`);
      console.log(`  Active: ${habit.isActive ? 'Yes' : 'No'}`);
      console.log();
    });
  }

  console.log("=".repeat(60));
  console.log(`Total habits queried: ${habitIds.length}`);
  console.log(`Found: ${validHabits.length}`);
}

const habitIds = process.argv.slice(2).map(Number);

if (habitIds.length === 0) {
  console.log("Usage: ts-node batch-query.ts [habit-id1] [habit-id2] ...");
  console.log("Example: ts-node batch-query.ts 1 2 3");
  process.exit(1);
}

batchQueryHabits(habitIds).catch(console.error);
