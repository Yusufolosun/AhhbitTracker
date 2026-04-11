import { createNetwork } from '@stacks/network';
import { getContractPrincipal, getRuntimeConfig } from '../shared/runtime-config';

const runtime = getRuntimeConfig();
const NETWORK = createNetwork({
  network: runtime.stacksNetwork,
  client: { baseUrl: runtime.stacksApiUrl },
});
const CONTRACT_PRINCIPAL = getContractPrincipal(runtime);

async function analyzeUserActivity(days: number = 7) {
  console.log(`Analyzing User Activity (Last ${days} days)`);
  console.log("=".repeat(60));
  
  const url = `${NETWORK.coreApiUrl}/extended/v1/address/${CONTRACT_PRINCIPAL}/transactions?limit=50`;
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
