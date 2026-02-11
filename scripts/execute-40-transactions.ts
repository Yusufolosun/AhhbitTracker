#!/usr/bin/env ts-node

/**
 * AhhbitTracker - Automated Transaction Executor
 * 
 * Executes 40 transactions on Stacks mainnet within 2.5 STX budget
 * Functions tested: create-habit, check-in, withdraw-stake, claim-bonus
 */

import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  uintCV,
  stringUtf8CV,
  getAddressFromPrivateKey,
} from '@stacks/transactions';
import { STACKS_MAINNET } from '@stacks/network';
import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { HDKey } from '@scure/bip32';
import * as fs from 'fs';
import * as readline from 'readline';

// ============================================
// CONFIGURATION (From Project)
// ============================================

const NETWORK = STACKS_MAINNET;
const CONTRACT_ADDRESS = 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193';
const CONTRACT_NAME = 'habit-tracker';

const TOTAL_TRANSACTIONS = 40;
const TOTAL_BUDGET_STX = 2.5;
const DELAY_BETWEEN_TX_MS = 120000; // 2 minutes

// ============================================
// TYPES
// ============================================

interface TransactionRecord {
  index: number;
  functionName: string;
  txId: string;
  status: 'submitted' | 'confirmed' | 'failed';
  fee: number;
  timestamp: number;
  error?: string;
}

interface ExecutionSummary {
  total: number;
  submitted: number;
  confirmed: number;
  failed: number;
  totalCost: number;
  transactions: TransactionRecord[];
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function promptUser(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function displayBanner() {
  console.log('═'.repeat(70));
  console.log('    AHHBITTRACKER - AUTOMATED TRANSACTION EXECUTOR');
  console.log('═'.repeat(70));
  console.log();
}

async function getUserWallet(): Promise<{ privateKey: string; address: string }> {
  console.log('🔐 WALLET SETUP');
  console.log('─'.repeat(70));
  console.log();
  console.log('⚠️  IMPORTANT: Use a wallet DIFFERENT from the deployer wallet');
  console.log('⚠️  This wallet must have at least 3 STX (budget + buffer)');
  console.log();
  console.log('You can provide either:');
  console.log('  1. Your 24-word mnemonic seed phrase');
  console.log('  2. Your 64-character hexadecimal private key');
  console.log();
  
  const input = await promptUser('Enter your credentials: ');
  
  // Check if input is a mnemonic (contains spaces, typically 12 or 24 words)
  if (input.includes(' ')) {
    const words = input.trim().split(/\s+/);
    if (words.length === 12 || words.length === 24) {
      console.log();
      console.log(`✅ Mnemonic phrase detected (${words.length} words)`);
      
      try {
        // Validate mnemonic
        if (!bip39.validateMnemonic(input, wordlist)) {
          throw new Error('Invalid mnemonic phrase');
        }
        
        // Derive seed from mnemonic
        const seed = await bip39.mnemonicToSeed(input);
        
        // Derive Stacks wallet path: m/44'/5757'/0'/0/0
        const masterKey = HDKey.fromMasterSeed(seed);
        const accountKey = masterKey.derive("m/44'/5757'/0'/0/0");
        
        if (!accountKey.privateKey) {
          throw new Error('Failed to derive private key');
        }
        
        const privateKey = Buffer.from(accountKey.privateKey).toString('hex');
        const address = getAddressFromPrivateKey(privateKey, 'mainnet');
        
        console.log(`✅ Wallet Address: ${address}`);
        console.log();
        
        return { privateKey, address };
      } catch (error: any) {
        throw new Error(`Failed to derive wallet from mnemonic: ${error.message}`);
      }
    } else {
      throw new Error(`Invalid mnemonic. Expected 12 or 24 words, got ${words.length}.`);
    }
  }
  
  // Check if input is a private key (64 hex characters)
  if (/^[0-9a-fA-F]{64}$/.test(input)) {
    console.log();
    console.log('✅ Private key detected');
    
    const privateKey = input;
    const address = getAddressFromPrivateKey(privateKey, 'mainnet');
    
    console.log(`✅ Wallet Address: ${address}`);
    console.log();
    
    return { privateKey, address };
  }
  
  throw new Error('Invalid input. Please provide either a 24-word mnemonic phrase or 64-character hexadecimal private key.');
}

async function checkBalance(address: string): Promise<number> {
  const url = `https://api.mainnet.hiro.so/v2/accounts/${address}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch balance: ${response.statusText}`);
  }
  
  const data = await response.json();
  // Stacks API v2 returns balance in data.stx.balance or data.balance
  const balanceMicroSTX = parseInt(data.stx?.balance || data.balance || '0');
  const balanceSTX = balanceMicroSTX / 1000000;
  
  return balanceSTX;
}

// ============================================
// TRANSACTION BUILDERS
// ============================================

async function createHabit(
  privateKey: string,
  habitName: string,
  stakeAmount: number,
  fee: number,
  nonce: number
): Promise<string> {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'create-habit',
    functionArgs: [stringUtf8CV(habitName), uintCV(stakeAmount)],
    senderKey: privateKey,
    network: NETWORK,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    fee: BigInt(Math.floor(fee)),
    nonce: BigInt(nonce),
  };

  const transaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction({ transaction, network: NETWORK });
  
  if ('error' in broadcastResponse) {
    throw new Error(broadcastResponse.error);
  }
  
  return broadcastResponse.txid;
}

async function checkIn(
  privateKey: string,
  habitId: number,
  fee: number,
  nonce: number
): Promise<string> {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'check-in',
    functionArgs: [uintCV(habitId)],
    senderKey: privateKey,
    network: NETWORK,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    fee: BigInt(Math.floor(fee)),
    nonce: BigInt(nonce),
  };

  const transaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction({ transaction, network: NETWORK });
  
  if ('error' in broadcastResponse) {
    throw new Error(broadcastResponse.error);
  }
  
  return broadcastResponse.txid;
}

async function withdrawStake(
  privateKey: string,
  habitId: number,
  fee: number,
  nonce: number
): Promise<string> {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'withdraw-stake',
    functionArgs: [uintCV(habitId)],
    senderKey: privateKey,
    network: NETWORK,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    fee: BigInt(Math.floor(fee)),
    nonce: BigInt(nonce),
  };

  const transaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction({ transaction, network: NETWORK });
  
  if ('error' in broadcastResponse) {
    throw new Error(broadcastResponse.error);
  }
  
  return broadcastResponse.txid;
}

async function claimBonus(
  privateKey: string,
  habitId: number,
  fee: number,
  nonce: number
): Promise<string> {
  const txOptions = {
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    functionName: 'claim-bonus',
    functionArgs: [uintCV(habitId)],
    senderKey: privateKey,
    network: NETWORK,
    anchorMode: AnchorMode.Any,
    postConditionMode: PostConditionMode.Allow,
    fee: BigInt(Math.floor(fee)),
    nonce: BigInt(nonce),
  };

  const transaction = await makeContractCall(txOptions);
  const broadcastResponse = await broadcastTransaction({ transaction, network: NETWORK });
  
  if ('error' in broadcastResponse) {
    throw new Error(broadcastResponse.error);
  }
  
  return broadcastResponse.txid;
}

// ============================================
// MAIN EXECUTION LOGIC
// ============================================

async function executeTransactions() {
  displayBanner();
  
  // Step 1: Get wallet credentials
  const { privateKey, address } = await getUserWallet();
  
  // Step 2: Check balance
  console.log('💰 BALANCE CHECK');
  console.log('─'.repeat(70));
  
  const balance = await checkBalance(address);
  console.log(`Current Balance: ${balance.toFixed(4)} STX`);
  
  if (balance < 3) {
    console.log();
    console.log('❌ ERROR: Insufficient balance');
    console.log(`   Required: 3 STX minimum`);
    console.log(`   Current: ${balance.toFixed(4)} STX`);
    console.log();
    console.log('Please fund your wallet and try again.');
    process.exit(1);
  }
  
  console.log('✅ Balance check passed');
  console.log();
  
  // Step 3: Calculate fees
  const budgetMicroSTX = TOTAL_BUDGET_STX * 1000000;
  const feePerTx = Math.floor(budgetMicroSTX / TOTAL_TRANSACTIONS);
  
  console.log('📊 EXECUTION PLAN');
  console.log('─'.repeat(70));
  console.log(`Contract: ${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);
  console.log(`Network: Stacks Mainnet`);
  console.log(`Total Transactions: ${TOTAL_TRANSACTIONS}`);
  console.log(`Total Budget: ${TOTAL_BUDGET_STX} STX`);
  console.log(`Fee per Transaction: ${(feePerTx / 1000000).toFixed(4)} STX`);
  console.log(`Delay Between Tx: ${DELAY_BETWEEN_TX_MS / 1000} seconds`);
  console.log();
  console.log('Transaction Distribution:');
  console.log('  • create-habit: 10 transactions (0.1 STX stake each)');
  console.log('  • check-in: 20 transactions (across created habits)');
  console.log('  • withdraw-stake: 5 transactions (will fail without 7-day streak)');
  console.log('  • claim-bonus: 5 transactions (will fail if pool empty)');
  console.log();
  console.log('⚠️  WARNING: This will execute REAL transactions on mainnet');
  console.log('⚠️  Transactions are irreversible');
  console.log('⚠️  Estimated duration: ~80 minutes');
  console.log();
  
  const confirm = await promptUser('Type "EXECUTE" to proceed: ');
  
  if (confirm !== 'EXECUTE') {
    console.log('Execution cancelled.');
    process.exit(0);
  }
  
  console.log();
  console.log('🚀 STARTING EXECUTION');
  console.log('═'.repeat(70));
  console.log();
  
  // Get starting nonce
  const nonceUrl = `https://api.mainnet.hiro.so/v2/accounts/${address}?proof=0`;
  const nonceResponse = await fetch(nonceUrl);
  const nonceData = await nonceResponse.json();
  let currentNonce = BigInt(nonceData.nonce);
  console.log(`Starting nonce: ${currentNonce}`);
  console.log();
  
  const results: TransactionRecord[] = [];
  
  // Transaction plan
  const plan = [
    ...Array(10).fill({ fn: 'create-habit', label: 'Create Habit' }),
    ...Array(20).fill({ fn: 'check-in', label: 'Check In' }),
    ...Array(5).fill({ fn: 'withdraw-stake', label: 'Withdraw Stake' }),
    ...Array(5).fill({ fn: 'claim-bonus', label: 'Claim Bonus' }),
  ];
  
  let createdHabits = 0;
  
  // Execute transactions
  for (let i = 0; i < TOTAL_TRANSACTIONS; i++) {
    const { fn, label } = plan[i];
    const txNum = i + 1;
    
    console.log(`[${txNum}/${TOTAL_TRANSACTIONS}] ${label}...`);
    
    try {
      let txId: string;
      
      switch (fn) {
        case 'create-habit':
          createdHabits++;
          txId = await createHabit(
            privateKey,
            `Test Habit ${createdHabits}`,
            100000, // 0.1 STX
            feePerTx,
            Number(currentNonce)
          );
          break;
          
        case 'check-in':
          const habitIdForCheckIn = (i % 10) + 1;
          txId = await checkIn(
            privateKey,
            habitIdForCheckIn,
            feePerTx,
            Number(currentNonce)
          );
          break;
          
        case 'withdraw-stake':
          const habitIdForWithdraw = (i - 30) + 1;
          txId = await withdrawStake(
            privateKey,
            habitIdForWithdraw,
            feePerTx,
            Number(currentNonce)
          );
          break;
          
        case 'claim-bonus':
          const habitIdForClaim = (i - 35) + 1;
          txId = await claimBonus(
            privateKey,
            habitIdForClaim,
            feePerTx,
            Number(currentNonce)
          );
          break;
          
        default:
          throw new Error(`Unknown function: ${fn}`);
      }
      
      console.log(`   ✅ Submitted: ${txId}`);
      console.log(`   📎 https://explorer.hiro.so/txid/${txId}?chain=mainnet`);
      
      results.push({
        index: txNum,
        functionName: fn,
        txId,
        status: 'submitted',
        fee: feePerTx,
        timestamp: Date.now(),
      });
      
      currentNonce = BigInt(Number(currentNonce) + 1);
      
    } catch (error: any) {
      console.log(`   ❌ Failed: ${error.message}`);
      
      results.push({
        index: txNum,
        functionName: fn,
        txId: '',
        status: 'failed',
        fee: 0,
        timestamp: Date.now(),
        error: error.message,
      });
    }
    
    // Delay before next transaction (except last one)
    if (i < TOTAL_TRANSACTIONS - 1) {
      console.log(`   ⏳ Waiting ${DELAY_BETWEEN_TX_MS / 1000} seconds...`);
      console.log();
      await sleep(DELAY_BETWEEN_TX_MS);
    }
  }
  
  // Save results
  const outputPath = 'scripts/transaction-results.json';
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  
  // Generate summary
  const submitted = results.filter(r => r.status === 'submitted').length;
  const failed = results.filter(r => r.status === 'failed').length;
  const totalCost = results
    .filter(r => r.status === 'submitted')
    .reduce((sum, r) => sum + r.fee, 0) / 1000000;
  
  console.log();
  console.log('═'.repeat(70));
  console.log('    EXECUTION COMPLETE');
  console.log('═'.repeat(70));
  console.log();
  console.log('📊 SUMMARY');
  console.log('─'.repeat(70));
  console.log(`Total Attempted: ${TOTAL_TRANSACTIONS}`);
  console.log(`Successfully Submitted: ${submitted}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success Rate: ${((submitted / TOTAL_TRANSACTIONS) * 100).toFixed(1)}%`);
  console.log();
  console.log(`Total Cost: ${totalCost.toFixed(4)} STX`);
  console.log(`Budget Used: ${((totalCost / TOTAL_BUDGET_STX) * 100).toFixed(1)}%`);
  console.log();
  console.log(`Results saved to: ${outputPath}`);
  console.log();
  console.log('🔗 VIEW TRANSACTIONS');
  console.log('─'.repeat(70));
  
  results
    .filter(r => r.txId)
    .slice(0, 5)
    .forEach(r => {
      console.log(`${r.functionName}: https://explorer.hiro.so/txid/${r.txId}?chain=mainnet`);
    });
  
  if (submitted > 5) {
    console.log(`... and ${submitted - 5} more in ${outputPath}`);
  }
  
  console.log();
  console.log('═'.repeat(70));
}

// ============================================
// ENTRY POINT
// ============================================

executeTransactions().catch(error => {
  console.error();
  console.error('❌ FATAL ERROR:', error.message);
  console.error();
  process.exit(1);
});
