import {
  getRuntimeConfig,
  getSafeRuntimeConfigSummary,
  parseContractPrincipal,
} from './shared/runtime-config';

const runtime = getRuntimeConfig();
const summary = getSafeRuntimeConfigSummary(runtime);
const API_URL = runtime.stacksApiUrl;

async function verifyDeployment(contractPrincipal: string) {
  const { contractAddress, contractName } = parseContractPrincipal(contractPrincipal, 'CLI contract principal');

  console.log("Verifying deployment...");
  console.log("Contract:", `${contractAddress}.${contractName}`);
  console.log("Network:", summary.stacksNetwork);
  console.log("API URL:", summary.stacksApiUrl);
  
  try {
    // 1. Check if contract exists
    const contractUrl = `${API_URL}/v2/contracts/interface/${contractAddress}/${contractName}`;
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
    const poolUrl = `${API_URL}/v2/contracts/call-read/${contractAddress}/${contractName}/get-pool-balance`;
    
    const poolResponse = await fetch(poolUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender: contractAddress, arguments: [] })
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

const contractPrincipal = process.argv[2];
if (!contractPrincipal) {
  console.log("Usage: ts-node verify-deployment.ts <CONTRACT_PRINCIPAL>");
  console.log("Example: ts-node verify-deployment.ts SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z.habit-tracker-v2");
  process.exit(1);
}

verifyDeployment(contractPrincipal);
