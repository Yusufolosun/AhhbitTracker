import { StacksMainnet } from "@stacks/network";

const NETWORK = new StacksMainnet();
const CONTRACT_ADDRESS = "SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193";
const CONTRACT_NAME = "habit-tracker";

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
