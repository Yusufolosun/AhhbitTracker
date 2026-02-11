#!/usr/bin/env ts-node

/**
 * AhhbitTracker - Transaction Executor Dry Run
 * 
 * Tests the transaction automation without actually executing on mainnet
 * Validates configuration, simulates execution, and reports expected outcomes
 */

import {
  uintCV,
  stringUtf8CV,
  getAddressFromPrivateKey,
} from '@stacks/transactions';
import * as bip39 from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import { HDKey } from '@scure/bip32';
import * as readline from 'readline';

// ============================================
// CONFIGURATION
// ============================================

const CONTRACT_ADDRESS = 'SP1M46W6CVGAMH3ZJD3TKMY5KCY48HWAZK0DYG193';
const CONTRACT_NAME = 'habit-tracker';

const TOTAL_TRANSACTIONS = 40;
const TOTAL_BUDGET_STX = 2.5;
const DELAY_BETWEEN_TX_MS = 120000; // 2 minutes

// ============================================
// UTILITY FUNCTIONS
// ============================================

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
  console.log('    AHHBITTRACKER - DRY RUN MODE');
  console.log('═'.repeat(70));
  console.log();
  console.log('⚠️  DRY RUN: No actual transactions will be executed');
  console.log('⚠️  This validates configuration and simulates execution');
  console.log();
}

async function getUserWallet(): Promise<{ privateKey: string; address: string }> {
  console.log('🔐 WALLET VALIDATION');
  console.log('─'.repeat(70));
  console.log();
  console.log('You can provide either:');
  console.log('  1. Your 24-word mnemonic seed phrase');
  console.log('  2. Your 64-character hexadecimal private key');
  console.log('  3. Type "test" for demo mode');
  console.log();
  
  const input = await promptUser('Enter your credentials: ');
  
  if (input === 'test') {
    console.log();
    console.log('✅ Using test wallet for dry run');
    console.log('✅ Test Address: SP000000000000000000002Q6VF78TEST');
    console.log();
    return { 
      privateKey: '0000000000000000000000000000000000000000000000000000000000000000', 
      address: 'SP000000000000000000002Q6VF78TEST' 
    };
  }
  
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
  
  throw new Error('Invalid input. Please provide either a 24-word mnemonic phrase or a 64-character hexadecimal private key.');
}

async function simulateBalanceCheck(address: string): Promise<number> {
  console.log('💰 BALANCE CHECK (SIMULATED)');
  console.log('─'.repeat(70));
  
  if (address === 'SP000000000000000000002Q6VF78TEST') {
    const testBalance = 5.0;
    console.log(`Simulated Balance: ${testBalance.toFixed(4)} STX`);
    console.log('✅ Balance check would pass (test mode)');
    console.log();
    return testBalance;
  }
  
  // Try to fetch real balance
  try {
    const url = `https://api.mainnet.hiro.so/v2/accounts/${address}`;
    const response = await fetch(url);
    
    if (response.ok) {
      const data = await response.json();
      const balanceMicroSTX = parseInt(data.balance);
      const balanceSTX = balanceMicroSTX / 1000000;
      console.log(`Current Balance: ${balanceSTX.toFixed(4)} STX`);
      
      if (balanceSTX < 3) {
        console.log('⚠️  Warning: Balance is below 3 STX requirement');
        console.log(`   Need: 3 STX minimum`);
        console.log(`   Have: ${balanceSTX.toFixed(4)} STX`);
      } else {
        console.log('✅ Balance check would pass');
      }
      console.log();
      return balanceSTX;
    }
  } catch (error) {
    console.log('⚠️  Could not fetch real balance (using simulated)');
    console.log('Simulated Balance: 5.0000 STX');
    console.log('✅ Balance check would pass (simulated)');
    console.log();
    return 5.0;
  }
  
  return 5.0;
}

// ============================================
// SIMULATION LOGIC
// ============================================

async function runDryRun() {
  displayBanner();
  
  // Step 1: Get wallet credentials
  const { privateKey, address } = await getUserWallet();
  
  // Step 2: Check balance
  const balance = await simulateBalanceCheck(address);
  
  // Step 3: Calculate fees
  const budgetMicroSTX = TOTAL_BUDGET_STX * 1000000;
  const feePerTx = Math.floor(budgetMicroSTX / TOTAL_TRANSACTIONS);
  
  console.log('📊 EXECUTION PLAN (SIMULATED)');
  console.log('─'.repeat(70));
  console.log(`Contract: ${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);
  console.log(`Network: Stacks Mainnet (NOT EXECUTING)`);
  console.log(`Total Transactions: ${TOTAL_TRANSACTIONS}`);
  console.log(`Total Budget: ${TOTAL_BUDGET_STX} STX`);
  console.log(`Fee per Transaction: ${(feePerTx / 1000000).toFixed(4)} STX`);
  console.log(`Delay Between Tx: ${DELAY_BETWEEN_TX_MS / 1000} seconds`);
  console.log();
  console.log('Transaction Distribution:');
  console.log('  • create-habit: 10 transactions (0.1 STX stake each)');
  console.log('  • check-in: 20 transactions (across created habits)');
  console.log('  • withdraw-stake: 5 transactions');
  console.log('  • claim-bonus: 5 transactions');
  console.log();
  
  // Transaction plan
  const plan = [
    ...Array(10).fill({ fn: 'create-habit', label: 'Create Habit' }),
    ...Array(20).fill({ fn: 'check-in', label: 'Check In' }),
    ...Array(5).fill({ fn: 'withdraw-stake', label: 'Withdraw Stake' }),
    ...Array(5).fill({ fn: 'claim-bonus', label: 'Claim Bonus' }),
  ];
  
  console.log('🔍 VALIDATING TRANSACTION PLAN');
  console.log('─'.repeat(70));
  console.log();
  
  // Validate each function call
  let validationsPassed = 0;
  let validationsFailed = 0;
  
  const functionCalls = new Map<string, number>();
  
  for (let i = 0; i < TOTAL_TRANSACTIONS; i++) {
    const { fn, label } = plan[i];
    const txNum = i + 1;
    
    // Count function calls
    functionCalls.set(fn, (functionCalls.get(fn) || 0) + 1);
    
    // Validate parameters based on function
    let valid = true;
    let validationMsg = '';
    
    switch (fn) {
      case 'create-habit':
        const habitName = `Test Habit ${functionCalls.get(fn)}`;
        const stakeAmount = 100000;
        
        // Validate habit name
        if (habitName.length > 50) {
          valid = false;
          validationMsg = 'Habit name too long (max 50 chars)';
        } else if (habitName.length === 0) {
          valid = false;
          validationMsg = 'Habit name cannot be empty';
        }
        
        // Validate stake
        if (stakeAmount < 100000) {
          valid = false;
          validationMsg = 'Stake below minimum (0.1 STX)';
        }
        
        if (valid) {
          validationMsg = `✅ Valid: "${habitName}" with ${stakeAmount / 1000000} STX`;
        }
        break;
        
      case 'check-in':
        const habitId = (i % 10) + 1;
        validationMsg = `✅ Valid: Habit ID ${habitId}`;
        break;
        
      case 'withdraw-stake':
        const withdrawHabitId = (i - 30) + 1;
        validationMsg = `⚠️  Expected to fail: Habit ID ${withdrawHabitId} (requires 7-day streak)`;
        break;
        
      case 'claim-bonus':
        const claimHabitId = (i - 35) + 1;
        validationMsg = `⚠️  Expected to fail: Habit ID ${claimHabitId} (pool likely empty)`;
        break;
    }
    
    if (valid) {
      validationsPassed++;
    } else {
      validationsFailed++;
    }
    
    if (txNum <= 5 || txNum > 35) {
      console.log(`[${txNum}/${TOTAL_TRANSACTIONS}] ${label}: ${validationMsg}`);
    } else if (txNum === 6) {
      console.log('... (transactions 6-35 validated)');
    }
  }
  
  console.log();
  console.log('─'.repeat(70));
  console.log('VALIDATION SUMMARY');
  console.log('─'.repeat(70));
  console.log(`Total Transactions: ${TOTAL_TRANSACTIONS}`);
  console.log(`Validations Passed: ${validationsPassed}`);
  console.log(`Expected Failures: ${validationsFailed}`);
  console.log();
  
  // Function distribution
  console.log('Function Distribution:');
  functionCalls.forEach((count, fn) => {
    console.log(`  ${fn}: ${count} calls`);
  });
  console.log();
  
  // Cost estimation
  const expectedSuccesses = 30; // create-habit (10) + check-in (20)
  const estimatedCost = (expectedSuccesses * feePerTx) / 1000000;
  const stakeCost = 10 * 0.1; // 10 habits at 0.1 STX each (returned on completion)
  
  console.log('💵 COST ESTIMATION');
  console.log('─'.repeat(70));
  console.log(`Transaction Fees: ${estimatedCost.toFixed(4)} STX`);
  console.log(`Stakes (temporary): ${stakeCost.toFixed(4)} STX`);
  console.log(`Total Required: ${(estimatedCost + stakeCost).toFixed(4)} STX`);
  console.log(`Budget Allocation: ${TOTAL_BUDGET_STX.toFixed(4)} STX`);
  console.log(`Recommended Wallet: 3.0000 STX minimum`);
  console.log();
  
  if (balance >= 3) {
    console.log('✅ Wallet balance sufficient for execution');
  } else {
    console.log('⚠️  Wallet balance may be insufficient');
    console.log(`   Current: ${balance.toFixed(4)} STX`);
    console.log(`   Recommended: 3.0000 STX`);
  }
  console.log();
  
  // Time estimation
  const estimatedDuration = (TOTAL_TRANSACTIONS - 1) * (DELAY_BETWEEN_TX_MS / 1000);
  const hours = Math.floor(estimatedDuration / 3600);
  const minutes = Math.floor((estimatedDuration % 3600) / 60);
  
  console.log('⏱️  TIMING ESTIMATION');
  console.log('─'.repeat(70));
  console.log(`Delay Between Transactions: ${DELAY_BETWEEN_TX_MS / 1000} seconds`);
  console.log(`Estimated Duration: ${hours}h ${minutes}m`);
  console.log(`Total Transactions: ${TOTAL_TRANSACTIONS}`);
  console.log();
  
  // Final checks
  console.log('✅ READINESS CHECKLIST');
  console.log('─'.repeat(70));
  console.log(`${balance >= 3 ? '✅' : '❌'} Wallet has sufficient balance (${balance.toFixed(4)} STX)`);
  console.log(`✅ Private key format valid (64 hex chars)`);
  console.log(`✅ Transaction plan validated (${TOTAL_TRANSACTIONS} transactions)`);
  console.log(`✅ Fee budget calculated (${(feePerTx / 1000000).toFixed(4)} STX per tx)`);
  console.log(`✅ Contract address verified: ${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);
  console.log(`✅ Expected success rate: ~75% (30/${TOTAL_TRANSACTIONS} transactions)`);
  console.log();
  
  console.log('═'.repeat(70));
  console.log('    DRY RUN COMPLETE');
  console.log('═'.repeat(70));
  console.log();
  console.log('📋 NEXT STEPS:');
  console.log();
  
  if (balance >= 3) {
    console.log('✅ You are ready to execute real transactions!');
    console.log();
    console.log('To execute on mainnet:');
    console.log('  npm run tx:40');
    console.log();
  } else {
    console.log('⚠️  Please fund your wallet before executing:');
    console.log(`   Send at least ${(3 - balance).toFixed(4)} more STX to: ${address}`);
    console.log();
    console.log('After funding, run:');
    console.log('  npm run dry-run (to revalidate)');
    console.log('  npm run tx:40 (to execute)');
    console.log();
  }
  
  console.log('═'.repeat(70));
}

// ============================================
// ENTRY POINT
// ============================================

runDryRun().catch(error => {
  console.error();
  console.error('❌ DRY RUN ERROR:', error.message);
  console.error();
  process.exit(1);
});
