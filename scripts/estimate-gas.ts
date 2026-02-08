const MAINNET_FEE_RATE = 10;

function estimateDeploymentCost() {
  const contractSize = 5000; // bytes (approximate)
  const baseFee = contractSize * MAINNET_FEE_RATE;
  
  console.log("Deployment Cost Estimate");
  console.log("Contract size:", contractSize, "bytes");
  console.log("Base fee:", baseFee, "microSTX");
  console.log("Estimated total:", (baseFee / 1000000).toFixed(2), "STX");
}

function estimateTransactionCosts() {
  console.log("\nTransaction Cost Estimates:");
  console.log("create-habit:", "~0.15-0.25 STX");
  console.log("check-in:", "~0.10-0.20 STX");
  console.log("withdraw-stake:", "~0.15-0.25 STX");
  console.log("claim-bonus:", "~0.15-0.25 STX");
}

estimateDeploymentCost();
estimateTransactionCosts();
