import { fetchNonce } from "@stacks/transactions";
import { createNetwork } from "@stacks/network";
import { assertStacksAddress, getRuntimeConfig } from "../shared/runtime-config";

const runtime = getRuntimeConfig();
const NETWORK = createNetwork({
  network: runtime.stacksNetwork,
  client: { baseUrl: runtime.stacksApiUrl },
});

async function checkNonce(address: string) {
  const normalizedAddress = assertStacksAddress(address, 'CLI address');

  console.log(`Checking nonce for: ${normalizedAddress}`);
  console.log("=".repeat(70));
  
  const nonce = await fetchNonce({ address: normalizedAddress, network: NETWORK });
  
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
