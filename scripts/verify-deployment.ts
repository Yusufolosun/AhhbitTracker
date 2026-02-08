import { StacksMainnet } from "@stacks/network";

const NETWORK = new StacksMainnet();

async function verifyDeployment(contractAddress: string) {
  console.log("Verifying deployment...");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", NETWORK.version);
  
  console.log("\nVerification steps:");
  console.log("1. Check contract exists on Explorer");
  console.log("2. Verify source code matches deployed");
  console.log("3. Test read-only functions");
  console.log("4. Execute test transaction");
}

const contractAddress = process.argv[2];
if (!contractAddress) {
  console.log("Usage: ts-node verify-deployment.ts [CONTRACT_ADDRESS]");
  process.exit(1);
}

verifyDeployment(contractAddress);
