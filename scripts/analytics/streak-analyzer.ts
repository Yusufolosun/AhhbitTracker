import { StacksMainnet } from "@stacks/network";
import { callReadOnlyFunction, uintCV, cvToJSON } from "@stacks/transactions";

const NETWORK = new StacksMainnet();
const CONTRACT_ADDRESS = "SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193";
const CONTRACT_NAME = "habit-tracker";

async function analyzeStreaks(habitIds: number[]) {
  console.log("Analyzing Habit Streaks");
  console.log("=".repeat(60));
  
  const streaks = await Promise.all(
    habitIds.map(async (id) => {
      const result = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: "get-habit-streak",
        functionArgs: [uintCV(id)],
        network: NETWORK,
        senderAddress: CONTRACT_ADDRESS,
      });
      
      const data = cvToJSON(result);
      return {
        habitId: id,
        streak: data.type === 'ok' ? parseInt(data.value.value) : 0
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
