import { StacksMainnet } from "@stacks/network";
import { callReadOnlyFunction, cvToJSON } from "@stacks/transactions";

const NETWORK = new StacksMainnet();
const CONTRACT_ADDRESS = "SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193";
const CONTRACT_NAME = "habit-tracker";

async function getContractStats() {
  console.log("=".repeat(60));
  console.log("CONTRACT STATISTICS");
  console.log("=".repeat(60));
  console.log();

  // Get pool balance
  const poolResult = await callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "get-forfeited-pool-balance",
    functionArgs: [],
    network: NETWORK,
    senderAddress: CONTRACT_ADDRESS,
  });

  const poolBalance = cvToJSON(poolResult);
  const poolSTX = parseInt(poolBalance.value.value) / 1000000;

  console.log("Forfeited Pool Balance:", poolSTX, "STX");
  console.log();

  // Get contract balance
  const balanceUrl = `${NETWORK.coreApiUrl}/v2/accounts/${CONTRACT_ADDRESS}.${CONTRACT_NAME}`;
  const balanceResponse = await fetch(balanceUrl);
  const balanceData = await balanceResponse.json();
  const contractBalance = parseInt(balanceData.balance) / 1000000;

  console.log("Total Contract Balance:", contractBalance, "STX");
  console.log();

  console.log("Statistics Summary:");
  console.log("- Pool available for bonuses:", poolSTX, "STX");
  console.log("- Total locked in active habits:", (contractBalance - poolSTX).toFixed(2), "STX");
  console.log();

  console.log("=".repeat(60));
}

getContractStats().catch(console.error);
