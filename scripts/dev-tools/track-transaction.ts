import { StacksMainnet } from "@stacks/network";

const NETWORK = new StacksMainnet();

async function trackTransaction(txId: string) {
  console.log(`Tracking transaction: ${txId}`);
  console.log("=".repeat(70));
  
  const url = `${NETWORK.coreApiUrl}/extended/v1/tx/${txId}`;
  
  let attempts = 0;
  const maxAttempts = 30;
  
  while (attempts < maxAttempts) {
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`Status: ${data.tx_status}`);
    
    if (data.tx_status === 'success') {
      console.log("✅ Transaction confirmed!");
      console.log();
      console.log("Details:");
      console.log(`  Block: ${data.block_height}`);
      console.log(`  Fee: ${(data.fee_rate / 1000000).toFixed(6)} STX`);
      console.log(`  Sender: ${data.sender_address}`);
      console.log();
      console.log(`View on Explorer:`);
      console.log(`  https://explorer.hiro.so/txid/${txId}?chain=mainnet`);
      break;
    } else if (data.tx_status === 'abort_by_response' || data.tx_status === 'abort_by_post_condition') {
      console.log("❌ Transaction failed");
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
