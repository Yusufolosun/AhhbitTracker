import dotenv from 'dotenv';
import { StacksMainnet, StacksTestnet } from '@stacks/network';

dotenv.config();

// Validate required environment variables
const requiredVars = ['CONTRACT_ADDRESS', 'CONTRACT_NAME', 'FUNCTION_NAME', 'TOTAL_TRANSACTIONS', 'MAX_BUDGET_STX'];
const missingVars = requiredVars.filter(v => !process.env[v]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('📝 Please copy .env.example to .env and configure it');
  process.exit(1);
}

// Validate wallet credentials
if (!process.env.PRIVATE_KEY && !process.env.MNEMONIC) {
  console.error('❌ Must provide either PRIVATE_KEY or MNEMONIC in .env');
  console.error('💡 For SPJJV79C95XD37H9Q91V4RZX9CBAM1G3ZAXAEWWY, export private key from Leather wallet');
  process.exit(1);
}

// Validate function-specific parameters
const functionName = process.env.FUNCTION_NAME;
if (functionName === 'create-habit' && !process.env.HABIT_NAME && !process.env.STAKE_AMOUNT) {
  console.error('❌ create-habit requires HABIT_NAME and STAKE_AMOUNT in .env');
  process.exit(1);
}
if (['check-in', 'withdraw-stake', 'claim-bonus'].includes(functionName) && !process.env.HABIT_IDS) {
  console.error(`❌ ${functionName} requires HABIT_IDS in .env`);
  process.exit(1);
}

export const config = {
  // Wallet
  privateKey: process.env.PRIVATE_KEY,
  mnemonic: process.env.MNEMONIC,
  
  // Contract
  contractAddress: process.env.CONTRACT_ADDRESS,
  contractName: process.env.CONTRACT_NAME,
  
  // Function
  functionName: process.env.FUNCTION_NAME,
  
  // Function parameters for create-habit
  habitName: process.env.HABIT_NAME || 'Habit #{number}',
  stakeAmount: parseInt(process.env.STAKE_AMOUNT || '100000'),
  
  // Function parameters for other functions (comma-separated habit IDs)
  habitIds: process.env.HABIT_IDS?.split(',').map(id => parseInt(id.trim())),
  
  // Transaction settings
  totalTransactions: parseInt(process.env.TOTAL_TRANSACTIONS),
  maxBudgetSTX: parseFloat(process.env.MAX_BUDGET_STX),
  delayBetweenTx: parseInt(process.env.DELAY_BETWEEN_TX || '5') * 1000, // Convert to ms
  
  // Network
  network: process.env.NETWORK === 'testnet' ? new StacksTestnet() : new StacksMainnet(),
  stacksApiUrl: process.env.STACKS_API_URL || 'https://api.mainnet.hiro.so',
  
  // Advanced
  feeMultiplier: parseFloat(process.env.FEE_MULTIPLIER || '1.2'),
  maxRetries: parseInt(process.env.MAX_RETRIES || '3'),
  retryDelay: parseInt(process.env.RETRY_DELAY || '5') * 1000,
  
  // Flags
  dryRun: process.env.DRY_RUN === 'true'
};

// Calculate per-transaction budget
config.maxFeePerTx = (config.maxBudgetSTX / config.totalTransactions) * 1000000; // Convert to microSTX

// Calculate total stakes for create-habit
if (config.functionName === 'create-habit') {
  const totalStake = (config.stakeAmount / 1000000) * config.totalTransactions;
  config.totalRequiredSTX = config.maxBudgetSTX + totalStake;
} else {
  config.totalRequiredSTX = config.maxBudgetSTX;
}

console.log('✅ Configuration loaded successfully');
console.log(`📊 Mode: ${config.dryRun ? 'DRY RUN (no transactions will be broadcast)' : 'LIVE'}`);
console.log(`🎯 Target: ${config.contractAddress}.${config.contractName}`);
console.log(`📝 Function: ${config.functionName}`);
console.log(`🔢 Transactions: ${config.totalTransactions}`);
console.log(`💰 Max fee budget: ${config.maxBudgetSTX} STX (~${(config.maxFeePerTx / 1000000).toFixed(6)} STX per tx)`);
if (config.functionName === 'create-habit') {
  console.log(`💵 Total stakes: ${((config.stakeAmount / 1000000) * config.totalTransactions).toFixed(4)} STX`);
  console.log(`💎 Total required: ${config.totalRequiredSTX.toFixed(4)} STX (fees + stakes)`);
}
