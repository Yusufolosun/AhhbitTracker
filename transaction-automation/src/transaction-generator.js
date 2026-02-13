import { 
  makeContractCall, 
  broadcastTransaction, 
  AnchorMode,
  stringUtf8CV,
  uintCV,
  PostConditionMode,
  getAddressFromPrivateKey,
  TransactionVersion
} from '@stacks/transactions';
import * as bip39 from 'bip39';
import * as scureBip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { HDKey } from '@scure/bip32';
import { config } from './config.js';
import { 
  getAccountNonce, 
  checkBalance, 
  estimateFee, 
  sleep, 
  saveTransactionLog, 
  formatSTX,
  generateHabitName,
  getExplorerLink,
  formatTransactionSummary
} from './utils.js';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

/**
 * Get private key from mnemonic or environment variable
 */
async function getPrivateKey() {
  if (config.privateKey) {
    return config.privateKey;
  }
  
  if (config.mnemonic) {
    // Validate using both libraries for compatibility
    if (!bip39.validateMnemonic(config.mnemonic)) {
      throw new Error('Invalid mnemonic phrase');
    }
    
    if (!scureBip39.validateMnemonic(config.mnemonic, wordlist)) {
      throw new Error('Invalid mnemonic phrase (scure validation)');
    }
    
    // Derive seed from mnemonic
    const seed = await scureBip39.mnemonicToSeed(config.mnemonic);
    
    // Use Leather/Hiro default derivation path
    const derivationPath = "m/44'/5757'/0'/0/0";
    const masterKey = HDKey.fromMasterSeed(seed);
    const accountKey = masterKey.derive(derivationPath);
    
    if (!accountKey.privateKey) {
      throw new Error('Failed to derive private key from mnemonic');
    }
    
    const privateKey = Buffer.from(accountKey.privateKey).toString('hex');
    
    console.log(`${colors.yellow}ℹ️  Derived using path: ${derivationPath}${colors.reset}`);
    
    return privateKey;
  }
  
  throw new Error('No private key or mnemonic provided');
}

/**
 * Build function arguments for AhhbitTracker contract
 */
function buildFunctionArgs(functionName, index) {
  switch (functionName) {
    case 'create-habit':
      // Parameters: habit-name (string-utf8), stake-amount (uint)
      const habitName = generateHabitName(config.habitName, index);
      return [
        stringUtf8CV(habitName),
        uintCV(config.stakeAmount)
      ];
      
    case 'check-in':
      // Parameter: habit-id (uint)
      if (!config.habitIds || index >= config.habitIds.length) {
        throw new Error(`No habit ID available for transaction ${index + 1}. Configure HABIT_IDS in .env`);
      }
      return [uintCV(config.habitIds[index])];
      
    case 'withdraw-stake':
      // Parameter: habit-id (uint)
      if (!config.habitIds || index >= config.habitIds.length) {
        throw new Error(`No habit ID available for transaction ${index + 1}. Configure HABIT_IDS in .env`);
      }
      return [uintCV(config.habitIds[index])];
      
    case 'claim-bonus':
      // Parameter: habit-id (uint)
      if (!config.habitIds || index >= config.habitIds.length) {
        throw new Error(`No habit ID available for transaction ${index + 1}. Configure HABIT_IDS in .env`);
      }
      return [uintCV(config.habitIds[index])];
      
    default:
      throw new Error(`Unsupported function: ${functionName}. Supported: create-habit, check-in, withdraw-stake, claim-bonus`);
  }
}

/**
 * Create and sign transaction
 */
async function createTransaction(privateKey, senderAddress, nonce, index) {
  const functionArgs = buildFunctionArgs(config.functionName, index);
  
  const txOptions = {
    contractAddress: config.contractAddress,
    contractName: config.contractName,
    functionName: config.functionName,
    functionArgs: functionArgs,
    senderKey: privateKey,
    network: config.network,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    nonce: BigInt(nonce),
    fee: BigInt(Math.floor(config.maxFeePerTx))
  };
  
  const transaction = await makeContractCall(txOptions);
  
  // Fee estimation and optimization for live transactions
  if (!config.dryRun) {
    try {
      const estimatedFee = await estimateFee(transaction, config.network);
      const adjustedFee = Math.floor(estimatedFee * config.feeMultiplier);
      
      if (adjustedFee <= config.maxFeePerTx) {
        txOptions.fee = BigInt(adjustedFee);
        return await makeContractCall(txOptions);
      }
    } catch (error) {
      console.warn(`${colors.yellow}⚠️  Fee estimation failed, using max fee${colors.reset}`);
    }
  }
  
  return transaction;
}

/**
 * Broadcast transaction with retry logic
 */
async function broadcastWithRetry(transaction, index) {
  let lastError;
  
  for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
    try {
      const result = await broadcastTransaction(transaction, config.network);
      
      if (result.error) {
        lastError = result;
        if (attempt < config.maxRetries) {
          console.log(`${colors.yellow}   ⚠️  Attempt ${attempt} failed: ${result.error}${colors.reset}`);
          console.log(`${colors.yellow}   ⏳ Retrying in ${config.retryDelay / 1000}s...${colors.reset}`);
          await sleep(config.retryDelay);
          continue;
        }
      } else {
        return { success: true, txId: result.txid || result };
      }
    } catch (error) {
      lastError = error;
      if (attempt < config.maxRetries) {
        console.log(`${colors.yellow}   ⚠️  Attempt ${attempt} failed: ${error.message}${colors.reset}`);
        await sleep(config.retryDelay);
        continue;
      }
    }
  }
  
  return { 
    success: false, 
    error: lastError?.error || lastError?.message || 'Unknown error' 
  };
}

/**
 * Main execution function
 */
async function main() {
  console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(70)}`);
  console.log(`   AHHBITTRACKER TRANSACTION AUTOMATION${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(70)}${colors.reset}\n`);
  
  const startTime = Date.now();
  const transactionLog = [];
  
  try {
    console.log(`${colors.blue}🔐 Deriving wallet credentials...${colors.reset}`);
    const privateKey = await getPrivateKey();
    
    // Derive address using correct TransactionVersion
    const txVersion = config.network.isMainnet() ? TransactionVersion.Mainnet : TransactionVersion.Testnet;
    const senderAddress = getAddressFromPrivateKey(privateKey, txVersion);
    
    console.log(`${colors.green}✅ Wallet address: ${senderAddress}${colors.reset}\n`);
    
    console.log(`${colors.blue}💰 Checking account balance...${colors.reset}`);
    const balance = await checkBalance(senderAddress, config.network);
    console.log(`${colors.green}✅ Current balance: ${balance.toFixed(6)} STX${colors.reset}`);
    
    // Balance validation
    const requiredBalance = config.totalRequiredSTX;
    if (balance < requiredBalance && !config.dryRun) {
      console.log(`${colors.red}❌ Insufficient balance!${colors.reset}`);
      console.log(`${colors.red}   Required: ${requiredBalance.toFixed(6)} STX${colors.reset}`);
      console.log(`${colors.red}   Have: ${balance.toFixed(6)} STX${colors.reset}`);
      console.log(`${colors.red}   Need: ${(requiredBalance - balance).toFixed(6)} more STX${colors.reset}`);
      
      if (config.functionName === 'create-habit') {
        console.log(`${colors.yellow}   (${config.maxBudgetSTX} STX fees + ${((config.stakeAmount / 1000000) * config.totalTransactions).toFixed(4)} STX stakes)${colors.reset}`);
      }
      
      process.exit(1);
    }
    
    console.log(`\n${colors.blue}🔢 Getting account nonce...${colors.reset}`);
    let currentNonce = await getAccountNonce(senderAddress, config.network);
    console.log(`${colors.green}✅ Starting nonce: ${currentNonce}${colors.reset}\n`);
    
    // Final warning for live execution
    if (!config.dryRun) {
      console.log(`${colors.bright}${colors.yellow}${'⚠'.repeat(35)}${colors.reset}`);
      console.log(`${colors.bright}${colors.yellow}   FINAL WARNING - LIVE EXECUTION${colors.reset}`);
      console.log(`${colors.bright}${colors.yellow}${'⚠'.repeat(35)}${colors.reset}`);
      console.log(`${colors.yellow}This will execute ${config.totalTransactions} REAL transactions on ${config.network.isMainnet() ? 'MAINNET' : 'TESTNET'}${colors.reset}`);
      console.log(`${colors.yellow}Function: ${config.functionName}${colors.reset}`);
      console.log(`${colors.yellow}Press Ctrl+C now to cancel, or wait 5 seconds to continue...${colors.reset}\n`);
      await sleep(5000);
    }
    
    console.log(`${colors.bright}${colors.cyan}${'='.repeat(70)}`);
    console.log(`   EXECUTING TRANSACTIONS${colors.reset}`);
    console.log(`${colors.cyan}${'='.repeat(70)}${colors.reset}\n`);
    
    let successful = 0;
    let failed = 0;
    
    for (let i = 0; i < config.totalTransactions; i++) {
      const txNumber = i + 1;
      console.log(`${colors.bright}[${txNumber}/${config.totalTransactions}] ${config.functionName.toUpperCase()}${colors.reset}`);
      console.log(`${colors.cyan}   ${formatTransactionSummary(null, i, config)}${colors.reset}`);
      
      try {
        console.log(`${colors.blue}   📝 Building transaction...${colors.reset}`);
        const transaction = await createTransaction(privateKey, senderAddress, currentNonce, i);
        
        if (config.dryRun) {
          console.log(`${colors.green}   ✅ DRY RUN: Transaction built successfully${colors.reset}`);
          console.log(`${colors.cyan}   💰 Fee: ${formatSTX(transaction.auth.spendingCondition.fee)} STX${colors.reset}`);
          
          transactionLog.push({
            index: txNumber,
            nonce: currentNonce,
            function: config.functionName,
            details: formatTransactionSummary(null, i, config),
            fee: formatSTX(transaction.auth.spendingCondition.fee),
            status: 'dry-run',
            timestamp: new Date().toISOString()
          });
          
          successful++;
          currentNonce++;
        } else {
          console.log(`${colors.blue}   📡 Broadcasting transaction...${colors.reset}`);
          const result = await broadcastWithRetry(transaction, i);
          
          if (result.success) {
            console.log(`${colors.green}   ✅ Success! TxID: ${result.txId}${colors.reset}`);
            console.log(`${colors.cyan}   🔗 ${getExplorerLink(result.txId, config.network)}${colors.reset}`);
            
            transactionLog.push({
              index: txNumber,
              nonce: currentNonce,
              txId: result.txId,
              function: config.functionName,
              details: formatTransactionSummary(null, i, config),
              fee: formatSTX(transaction.auth.spendingCondition.fee),
              status: 'broadcasted',
              timestamp: new Date().toISOString(),
              explorerLink: getExplorerLink(result.txId, config.network)
            });
            
            successful++;
            currentNonce++;
          } else {
            console.log(`${colors.red}   ❌ Failed: ${result.error}${colors.reset}`);
            
            transactionLog.push({
              index: txNumber,
              nonce: currentNonce,
              function: config.functionName,
              details: formatTransactionSummary(null, i, config),
              status: 'failed',
              error: result.error,
              timestamp: new Date().toISOString()
            });
            
            failed++;
            currentNonce++;
          }
        }
        
        console.log(`${colors.magenta}   📊 Progress: ${successful} successful, ${failed} failed${colors.reset}`);
        
        // Delay before next transaction
        if (i < config.totalTransactions - 1) {
          console.log(`${colors.yellow}   ⏳ Waiting ${config.delayBetweenTx / 1000}s before next transaction...${colors.reset}\n`);
          await sleep(config.delayBetweenTx);
        }
        
      } catch (error) {
        console.log(`${colors.red}   ❌ Error: ${error.message}${colors.reset}\n`);
        
        transactionLog.push({
          index: txNumber,
          nonce: currentNonce,
          function: config.functionName,
          status: 'error',
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        failed++;
        currentNonce++;
      }
    }
    
    const endTime = Date.now();
    const totalTime = ((endTime - startTime) / 1000).toFixed(2);
    
    console.log(`\n${colors.bright}${colors.cyan}${'='.repeat(70)}`);
    console.log(`   EXECUTION COMPLETE${colors.reset}`);
    console.log(`${colors.cyan}${'='.repeat(70)}${colors.reset}\n`);
    
    console.log(`${colors.green}✅ Successful: ${successful}${colors.reset}`);
    console.log(`${colors.red}❌ Failed: ${failed}${colors.reset}`);
    console.log(`${colors.blue}⏱️  Total time: ${totalTime}s${colors.reset}`);
    console.log(`${colors.blue}📊 Average: ${(totalTime / config.totalTransactions).toFixed(2)}s per transaction${colors.reset}\n`);
    
    // Save comprehensive transaction log
    await saveTransactionLog({
      summary: {
        total: config.totalTransactions,
        successful,
        failed,
        totalTimeSeconds: parseFloat(totalTime),
        mode: config.dryRun ? 'dry-run' : 'live',
        network: config.network.isMainnet() ? 'mainnet' : 'testnet',
        contractAddress: config.contractAddress,
        contractName: config.contractName,
        functionName: config.functionName,
        senderAddress,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString()
      },
      transactions: transactionLog
    });
    
    if (!config.dryRun && successful > 0) {
      console.log(`\n${colors.yellow}💡 Transactions may take 10-30 minutes to confirm on-chain${colors.reset}`);
      console.log(`${colors.yellow}💡 Check status at: https://explorer.hiro.so${colors.reset}\n`);
    }
    
    process.exit(failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error(`\n${colors.red}${colors.bright}❌ FATAL ERROR${colors.reset}`);
    console.error(`${colors.red}${error.message}${colors.reset}`);
    console.error(error.stack);
    
    if (transactionLog.length > 0) {
      await saveTransactionLog({
        summary: { 
          status: 'aborted', 
          error: error.message,
          contractAddress: config.contractAddress,
          contractName: config.contractName,
          functionName: config.functionName
        },
        transactions: transactionLog
      });
    }
    
    process.exit(1);
  }
}

main();
