import { fetchNonce } from "@stacks/transactions";
import { STACKS_MAINNET } from "@stacks/network";

const NETWORK = STACKS_MAINNET;

async function checkNonce(address: string) {
  console.log(`Checking nonce for: ${address}`);
  console.log("=".repeat(70));
  
  const nonce = await fetchNonce({ address, network: NETWORK });
  
  console.log(`Current Nonce: ${nonce}`);
  console.log(`Next Transaction Nonce: ${Number(nonce)}`);
  console.log();
  console.log("Use this nonce for your next transaction");
}

const address = process.argv[2];

if (!address) {
  console.log("Usage: ts-node get-nonce.ts <address>");
  process.exit(1);
}

checkNonce(address).catch(console.error);
