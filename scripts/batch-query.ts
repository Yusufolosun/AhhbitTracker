import { StacksMainnet } from "@stacks/network";
import { callReadOnlyFunction, uintCV, cvToJSON } from "@stacks/transactions";

const NETWORK = new StacksMainnet();
const CONTRACT_ADDRESS = "SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193";
const CONTRACT_NAME = "habit-tracker";

async function batchQueryHabits(habitIds: number[]) {
  console.log(`Querying ${habitIds.length} habits...`);
  console.log();

  const results = await Promise.all(
    habitIds.map(async (id) => {
      const result = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "get-habit",
        functionArgs: [uintCV(id)],
        network: NETWORK,
        senderAddress: CONTRACT_ADDRESS,
      });

      const data = cvToJSON(result);
      if (data.type === "none") return null;

      return {
        id,
        owner: data.value.value.owner.value,
        name: data.value.value.name.value,
        stake: parseInt(data.value.value["stake-amount"].value) / 1000000,
        streak: parseInt(data.value.value["current-streak"].value),
        active: data.value.value["is-active"].value,
        completed: data.value.value["is-completed"].value,
      };
    })
  );

  const validHabits = results.filter((h) => h !== null);

  console.log("Habit Summary:");
  console.log("=".repeat(60));
  validHabits.forEach((habit: any) => {
    console.log(`Habit #${habit.id}: ${habit.name}`);
    console.log(`  Stake: ${habit.stake} STX`);
    console.log(`  Streak: ${habit.streak} days`);
    console.log(`  Status: ${habit.active ? "Active" : habit.completed ? "Completed" : "Forfeited"}`);
    console.log();
  });

  console.log("=".repeat(60));
  console.log(`Total habits queried: ${validHabits.length}`);
  console.log(`Active: ${validHabits.filter((h: any) => h.active).length}`);
  console.log(`Completed: ${validHabits.filter((h: any) => h.completed).length}`);
  console.log(`Total staked: ${validHabits.reduce((sum: number, h: any) => sum + h.stake, 0).toFixed(2)} STX`);
}

const habitIds = process.argv.slice(2).map(Number);

if (habitIds.length === 0) {
  console.log("Usage: ts-node batch-query.ts [habit-id1] [habit-id2] ...");
  console.log("Example: ts-node batch-query.ts 1 2 3");
  process.exit(1);
}

batchQueryHabits(habitIds).catch(console.error);
