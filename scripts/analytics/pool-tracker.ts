import * as fs from "fs";
import { createContractReadonlyClient } from "../shared/contract-readonly";

const CONTRACT_ADDRESS = "SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z";
const CONTRACT_NAME = "habit-tracker-v2";

const client = createContractReadonlyClient({
  contractAddress: CONTRACT_ADDRESS,
  contractName: CONTRACT_NAME,
  mode: 'mainnet',
  baseUrl: 'https://api.mainnet.hiro.so',
});

interface PoolSnapshot {
  timestamp: number;
  balance: number;
  balanceSTX: number;
}

async function trackPoolBalance() {
  const balance = await client.getPoolBalance();
  
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
