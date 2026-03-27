import { STACKS_MAINNET } from "@stacks/network";
import { callReadOnlyFunction, cvToJSON } from "@stacks/transactions";
import * as fs from "fs";

const NETWORK = STACKS_MAINNET;
const CONTRACT_ADDRESS = "SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z";
const CONTRACT_NAME = "habit-tracker-v2";

interface PoolSnapshot {
  timestamp: number;
  balance: number;
  balanceSTX: number;
}

async function trackPoolBalance() {
  const result = await callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: "get-pool-balance",
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
