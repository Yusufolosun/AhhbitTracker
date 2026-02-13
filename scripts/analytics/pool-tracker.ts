import { StacksMainnet } from "@stacks/network";
import { callReadOnlyFunction, cvToJSON } from "@stacks/transactions";
import * as fs from "fs";

const NETWORK = new StacksMainnet();
const CONTRACT_ADDRESS = "SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193";
const CONTRACT_NAME = "habit-tracker";

interface PoolSnapshot {
  timestamp: number;
  balance: number;
  balanceSTX: number;
}

async function trackPoolBalance() {
  const result = await callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "get-forfeited-pool-balance",
    functionArgs: [],
    network: NETWORK,
    senderAddress: CONTRACT_ADDRESS,
  });
  
  const data = cvToJSON(result);
  const balance = parseInt(data.value.value);
  
  const snapshot: PoolSnapshot = {
    timestamp: Date.now(),
    balance,
    balanceSTX: balance / 1000000
  };
  
  // Append to history
  const historyPath = 'scripts/analytics/pool-history.json';
  let history: PoolSnapshot[] = [];
  
  if (fs.existsSync(historyPath)) {
    history = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
  }
  
  history.push(snapshot);
  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
  
  console.log(`Pool Balance: ${snapshot.balanceSTX} STX`);
  console.log(`Snapshot saved to ${historyPath}`);
  
  return snapshot;
}

trackPoolBalance().catch(console.error);

export { trackPoolBalance };
