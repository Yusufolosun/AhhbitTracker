const CONTRACT_ADDRESS = "SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193";
const CONTRACT_NAME = "habit-tracker";
const NETWORK_API = "https://api.mainnet.hiro.so";

async function getHabit(habitId: number) {
  // Use the correct Clarity value encoding for uint
  const habitIdHex = '0x' + habitId.toString().padStart(32, '0').split('').map(c => c.charCodeAt(0).toString(16)).join('');
  
  const url = `${NETWORK_API}/v2/contracts/call-read/${CONTRACT_ADDRESS}/${CONTRACT_NAME}/get-habit`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sender: CONTRACT_ADDRESS,
      arguments: [`0x00000000000000000000000000000000${habitId.toString(16).padStart(16, '0')}`]
    })
  });
  
  const text = await response.text();
  try {
    const data = JSON.parse(text);
    return data;
  } catch (e) {
    console.error(`Failed to parse response for habit ${habitId}:`, text.substring(0, 200));
    return { okay: false, result: 'none' };
  }
}

async function batchQueryHabits(habitIds: number[]) {
  console.log(`Querying ${habitIds.length} habits...`);
  console.log();

  const results = await Promise.all(
    habitIds.map(async (id) => {
      try {
        const result = await getHabit(id);
        
        if (!result.okay || result.result.includes('none')) {
          return null;
        }

        // Parse the Clarity response (simplified parsing)
        const habitData = result.result;
        
        return {
          id,
          rawData: habitData,
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
      console.log(`  Status: Exists`);
      console.log(`  Raw data: ${habit.rawData.substring(0, 100)}...`);
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
