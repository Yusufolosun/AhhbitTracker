import { fetchCallReadOnlyFunction, uintCV, stringUtf8CV, principalCV, cvToJSON } from "@stacks/transactions";
import { createNetwork } from '@stacks/network';
import { getRuntimeConfig } from '../shared/runtime-config';

const runtime = getRuntimeConfig();
const NETWORK = createNetwork({
  network: runtime.stacksNetwork,
  client: { baseUrl: runtime.stacksApiUrl },
});
const CONTRACT_ADDRESS = runtime.contractAddress;
const CONTRACT_NAME = runtime.contractName;

async function testReadOnlyFunction(
  functionName: string,
  args: any[]
) {
  console.log(`Testing: ${functionName}`);
  console.log("=".repeat(70));
  
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName,
      functionArgs: args,
      network: NETWORK,
      senderAddress: CONTRACT_ADDRESS,
    });
    
    console.log("Result:");
    console.log(JSON.stringify(cvToJSON(result), null, 2));
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
