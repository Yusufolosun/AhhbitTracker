import { StacksMainnet } from "@stacks/network";

const NETWORK = new StacksMainnet();
const CONTRACT_ADDRESS = "SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193";
const CONTRACT_NAME = "habit-tracker";

async function analyzeUserActivity(days: number = 7) {
  console.log(`Analyzing User Activity (Last ${days} days)`);
  console.log("=".repeat(60));
  
  const url = `${NETWORK.coreApiUrl}/extended/v1/address/${CONTRACT_ADDRESS}.${CONTRACT_NAME}/transactions?limit=50`;
  const response = await fetch(url);
  const data = await response.json();
  
  const transactions = data.results || [];
  const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
  
  const recentTx = transactions.filter((tx: any) => {
    const txTime = tx.burn_block_time * 1000;
    return txTime > cutoffTime;
  });
  
  const functionCalls = recentTx.reduce((acc: any, tx: any) => {
    if (tx.tx_type === 'contract_call') {
      const fn = tx.contract_call?.function_name || 'unknown';
      acc[fn] = (acc[fn] || 0) + 1;
    }
    return acc;
  }, {});
  
  console.log(`Total Transactions: ${recentTx.length}`);
  console.log();
  console.log("Function Call Distribution:");
  Object.entries(functionCalls).forEach(([fn, count]) => {
    console.log(`  ${fn}: ${count}`);
  });
  console.log();
  
  return { totalTransactions: recentTx.length, functionCalls };
}

analyzeUserActivity().catch(console.error);

export { analyzeUserActivity };
