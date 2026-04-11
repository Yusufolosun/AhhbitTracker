import { createContractReadonlyClient } from "../shared/contract-readonly";
import { getRuntimeConfig } from '../shared/runtime-config';

const runtime = getRuntimeConfig();

const client = createContractReadonlyClient({
  contractAddress: runtime.contractAddress,
  contractName: runtime.contractName,
  mode: runtime.stacksNetwork,
  baseUrl: runtime.stacksApiUrl,
});

async function analyzeStreaks(habitIds: number[]) {
  console.log("Analyzing Habit Streaks");
  console.log("=".repeat(60));
  
  const streaks = await Promise.all(
    habitIds.map(async (id) => {
      const streak = await client.getHabitStreak(id);
      return {
        habitId: id,
        streak,
      };
    })
  );
  
  const totalStreaks = streaks.reduce((sum, s) => sum + s.streak, 0);
  const avgStreak = totalStreaks / streaks.length;
  const maxStreak = Math.max(...streaks.map(s => s.streak));
  
  console.log(`Total Habits Analyzed: ${habitIds.length}`);
  console.log(`Average Streak: ${avgStreak.toFixed(2)} days`);
  console.log(`Maximum Streak: ${maxStreak} days`);
  console.log();
  
  return { streaks, avgStreak, maxStreak };
}

export { analyzeStreaks };
