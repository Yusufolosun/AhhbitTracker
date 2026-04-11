import { createNetwork } from '@stacks/network';
import { getRuntimeConfig } from '../shared/runtime-config';

const runtime = getRuntimeConfig();
const NETWORK = createNetwork({
  network: runtime.stacksNetwork,
  client: { baseUrl: runtime.stacksApiUrl },
});
const CONTRACT_ADDRESS = runtime.contractAddress;
const CONTRACT_NAME = runtime.contractName;

async function inspectContract() {
  console.log("Contract Inspector");
  console.log("=".repeat(70));
  console.log();
  
  // Get contract source
  const sourceUrl = `${NETWORK.coreApiUrl}/v2/contracts/source/${CONTRACT_ADDRESS}/${CONTRACT_NAME}`;
  const sourceResponse = await fetch(sourceUrl);
  const sourceData = await sourceResponse.json();
  
  console.log("Contract Source Code:");
  console.log("-".repeat(70));
  console.log(sourceData.source);
  console.log();
  
  // Get contract interface
  const interfaceUrl = `${NETWORK.coreApiUrl}/v2/contracts/interface/${CONTRACT_ADDRESS}/${CONTRACT_NAME}`;
  const interfaceResponse = await fetch(interfaceUrl);
  const interfaceData = await interfaceResponse.json();
  
  console.log("Contract Interface:");
  console.log("-".repeat(70));
  console.log(JSON.stringify(interfaceData, null, 2));
}

inspectContract().catch(console.error);
