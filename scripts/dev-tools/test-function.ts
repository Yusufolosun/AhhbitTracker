import { callReadOnlyFunction, uintCV, stringUtf8CV, principalCV } from "@stacks/transactions";
import { STACKS_MAINNET } from "@stacks/network";

const NETWORK = STACKS_MAINNET;
const CONTRACT_ADDRESS = "SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z";
const CONTRACT_NAME = "habit-tracker-v2";

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
    console.log("[OK] Function call successful");
    
  } catch (error: any) {
    console.log("[FAIL] Error:", error.message);
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
} else if (fn === 'get-pool-balance') {
  testReadOnlyFunction('get-pool-balance', []);
} else {
  console.log("Unsupported function or missing parameters");
}
