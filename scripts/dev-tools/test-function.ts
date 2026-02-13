import { callReadOnlyFunction, uintCV, stringUtf8CV, principalCV } from "@stacks/transactions";
import { StacksMainnet } from "@stacks/network";

const NETWORK = new StacksMainnet();
const CONTRACT_ADDRESS = "SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193";
const CONTRACT_NAME = "habit-tracker";

async function testReadOnlyFunction(
  functionName: string,
  args: any[]
) {
  console.log(`Testing: ${functionName}`);
  console.log("=".repeat(70));
  
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName,
      functionArgs: args,
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });
    
    console.log("Result:");
    console.log(JSON.stringify(result, null, 2));
    console.log();
    console.log("✅ Function call successful");
    
  } catch (error: any) {
    console.log("❌ Error:", error.message);
  }
}

// Example usage
const fn = process.argv[2];
const habitId = process.argv[3];

if (!fn) {
  console.log("Usage: ts-node test-function.ts <function-name> [habit-id]");
  console.log("Example: ts-node test-function.ts get-habit 1");
  process.exit(1);
}

if (fn === 'get-habit' && habitId) {
  testReadOnlyFunction('get-habit', [uintCV(parseInt(habitId))]);
} else if (fn === 'get-forfeited-pool-balance') {
  testReadOnlyFunction('get-forfeited-pool-balance', []);
} else {
  console.log("Unsupported function or missing parameters");
}
