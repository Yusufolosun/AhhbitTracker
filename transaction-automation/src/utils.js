import { StacksMainnet } from '@stacks/network';
import fs from 'fs/promises';

/**
 * Get account nonce from Stacks API
 */
export async function getAccountNonce(address, network) {
  const url = `${network.coreApiUrl}/v2/accounts/${address}?proof=0`;
  const response = await fetch(url);
  const data = await response.json();
  return data.nonce;
}

/**
 * Check account balance
 */
export async function checkBalance(address, network) {
  const url = `${network.coreApiUrl}/v2/accounts/${address}?proof=0`;
  const response = await fetch(url);
  const data = await response.json();
  return parseInt(data.balance) / 1000000; // Convert to STX
}

/**
 * Estimate transaction fee
 */
export async function estimateFee(transaction, network) {
  try {
    const url = `${network.coreApiUrl}/v2/fees/transaction`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transaction: transaction.serialize().toString('hex') })
    });
    const data = await response.json();
    return data.estimations?.[0]?.fee || 1000;
  } catch (error) {
    console.warn('⚠️  Fee estimation failed, using default');
    return 1000;
  }
}

/**
 * Sleep utility
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Save transaction log
 */
export async function saveTransactionLog(transactions) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `logs/transactions-${timestamp}.json`;
  
  await fs.mkdir('logs', { recursive: true });
  await fs.writeFile(filename, JSON.stringify(transactions, null, 2));
  
  console.log(`\n💾 Transaction log saved: ${filename}`);
  return filename;
}

/**
 * Format STX amount - CRITICAL: Handle BigInt
 */
export function formatSTX(microSTX) {
  // Convert BigInt to Number if necessary
  const amount = typeof microSTX === 'bigint' ? Number(microSTX) : microSTX;
  return (amount / 1000000).toFixed(6);
}

/**
 * Generate habit name with transaction number
 */
export function generateHabitName(template, index) {
  return template.replace('#{number}', index + 1);
}

/**
 * Get explorer link
 */
export function getExplorerLink(txId, network) {
  const chain = network instanceof StacksMainnet ? 'mainnet' : 'testnet';
  return `https://explorer.hiro.so/txid/${txId}?chain=${chain}`;
}

/**
 * Format transaction summary
 */
export function formatTransactionSummary(transaction, index, config) {
  const parts = [];
  
  switch (config.functionName) {
    case 'create-habit':
      const habitName = generateHabitName(config.habitName, index);
      const stakeSTX = (config.stakeAmount / 1000000).toFixed(4);
      parts.push(`Habit "${habitName}" with ${stakeSTX} STX stake`);
      break;
    case 'check-in':
      parts.push(`Check-in for habit ID ${config.habitIds[index]}`);
      break;
    case 'withdraw-stake':
      parts.push(`Withdraw stake for habit ID ${config.habitIds[index]}`);
      break;
    case 'claim-bonus':
      parts.push(`Claim bonus for habit ID ${config.habitIds[index]}`);
      break;
  }
  
  return parts.join(', ');
}
