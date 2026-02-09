const CONTRACT_ADDRESS = "SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193";
const CONTRACT_NAME = "habit-tracker";
const NETWORK_API = "https://api.mainnet.hiro.so";

async function getContractStats() {
  console.log("=".repeat(60));
  console.log("CONTRACT STATISTICS");
  console.log("=".repeat(60));
  console.log();

  try {
    // Get pool balance via read-only function call
    const poolUrl = `${NETWORK_API}/v2/contracts/call-read/${CONTRACT_ADDRESS}/${CONTRACT_NAME}/get-forfeited-pool-balance`;
    const poolResponse = await fetch(poolUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sender: CONTRACT_ADDRESS,
        arguments: []
      })
    });
    
    const poolData = await poolResponse.json();
    const poolSTX = poolData.okay ? parseInt(poolData.result.replace('(ok u', '').replace(')', '')) / 1000000 : 0;

    console.log("Forfeited Pool Balance:", poolSTX, "STX");
    console.log();

    // Get contract balance
    const balanceUrl = `${NETWORK_API}/v2/accounts/${CONTRACT_ADDRESS}.${CONTRACT_NAME}`;
    const balanceResponse = await fetch(balanceUrl);
    const balanceData = await balanceResponse.json();
    const contractBalance = parseInt(balanceData.balance) / 1000000;

    console.log("Total Contract Balance:", contractBalance, "STX");
    console.log();

    console.log("Statistics Summary:");
    console.log("- Pool available for bonuses:", poolSTX, "STX");
    console.log("- Total locked in active habits:", (contractBalance - poolSTX).toFixed(2), "STX");
    console.log();

    console.log("=".repeat(60));
  } catch (error: any) {
    console.error("Error fetching stats:", error.message);
  }
}

getContractStats().catch(console.error);
