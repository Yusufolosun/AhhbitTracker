import { STACKS_MAINNET } from "@stacks/network";

const NETWORK = STACKS_MAINNET;
const CONTRACT_ADDRESS = "SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z";
const CONTRACT_NAME = "habit-tracker-v2";

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
