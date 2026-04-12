import { createNetwork } from "@stacks/network";
import { getRuntimeConfig } from "../shared/runtime-config";

const runtime = getRuntimeConfig();
const NETWORK = createNetwork({
  network: runtime.stacksNetwork,
  client: { baseUrl: runtime.stacksApiUrl },
});

function normalizeTxId(value: string): string {
  const normalized = value.trim().toLowerCase().replace(/^0x/, '');

  if (!/^[a-f0-9]{64}$/.test(normalized)) {
    throw new Error('Invalid tx id. Expected 64 hex characters.');
  }

  return normalized;
}

async function trackTransaction(txId: string) {
  const normalizedTxId = normalizeTxId(txId);

  console.log(`Tracking transaction: ${normalizedTxId}`);
  console.log("=".repeat(70));
  
  const url = `${NETWORK.coreApiUrl}/extended/v1/tx/${normalizedTxId}`;
  
  let attempts = 0;
  const maxAttempts = 30;
  
  while (attempts < maxAttempts) {
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`Status: ${data.tx_status}`);
    
    if (data.tx_status === 'success') {
      console.log("[OK] Transaction confirmed!");
      console.log();
      console.log("Details:");
      console.log(`  Block: ${data.block_height}`);
      console.log(`  Fee: ${(data.fee_rate / 1000000).toFixed(6)} STX`);
      console.log(`  Sender: ${data.sender_address}`);
      console.log();
      console.log(`View on Explorer:`);
      console.log(`  https://explorer.hiro.so/txid/${normalizedTxId}?chain=${runtime.stacksNetwork}`);
      break;
    } else if (data.tx_status === 'abort_by_response' || data.tx_status === 'abort_by_post_condition') {
      console.log("[FAIL] Transaction failed");
      console.log(`Reason: ${data.tx_status}`);
      break;
    }
    
    attempts++;
    console.log(`Waiting... (${attempts}/${maxAttempts})`);
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
}

const txId = process.argv[2];

if (!txId) {
  console.log("Usage: ts-node track-transaction.ts <tx-id>");
  process.exit(1);
}

trackTransaction(txId).catch(console.error);
