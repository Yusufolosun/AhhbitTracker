import { getRuntimeConfig } from './shared/runtime-config';

const runtime = getRuntimeConfig();
const API_URL = runtime.stacksApiUrl;

async function verifyDeployment(contractAddress: string) {
  console.log("Verifying deployment...");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", runtime.stacksNetwork);
  console.log("API URL:", API_URL);
  
  try {
    // 1. Check if contract exists
    const contractUrl = `${API_URL}/v2/contracts/interface/${contractAddress}`;
    console.log("\n1. Checking contract interface...");
    
    const response = await fetch(contractUrl);
    if (!response.ok) {
      console.error("   ❌ Contract not found or inaccessible");
      return;
    }
    
    const contractInterface = await response.json();
    console.log("   ✓ Contract found");
    console.log(`   - Functions: ${contractInterface.functions?.length || 0}`);
    console.log(`   - Maps: ${contractInterface.maps?.length || 0}`);
    console.log(`   - Variables: ${contractInterface.variables?.length || 0}`);
    
    // 2. Test read-only function
    console.log("\n2. Testing read-only function (get-pool-balance)...");
    const [address, name] = contractAddress.split('.');
    const poolUrl = `${API_URL}/v2/contracts/call-read/${address}/${name}/get-pool-balance`;
    
    const poolResponse = await fetch(poolUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: address, arguments: [] })
    });
    
    if (poolResponse.ok) {
      const poolData = await poolResponse.json();
      console.log("   ✓ Read-only function works");
      console.log(`   - Response: ${JSON.stringify(poolData)}`);
    } else {
      console.error("   ❌ Read-only function failed");
    }
    
    console.log("\n✓ Deployment verification complete");
    
  } catch (error: any) {
    console.error("Verification failed:", error.message);
  }
}

const contractAddress = process.argv[2];
if (!contractAddress) {
  console.log("Usage: ts-node verify-deployment.ts <CONTRACT_ADDRESS>");
  console.log("Example: ts-node verify-deployment.ts SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z.habit-tracker-v2");
  process.exit(1);
}

verifyDeployment(contractAddress);
