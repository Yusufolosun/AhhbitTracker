/**
 * 48-Wallet Batch Transaction Automation System
 *
 * Executes batch operations across up to 48 active wallets on Stacks mainnet
 * against the habit-tracker-v2 contract.
 *
 * Operations:
 *   1. CREATE-HABIT  — Each wallet creates 1 habit
 *   2. CHECK-IN      — Each wallet checks in on its created habits
 *   3. WITHDRAW      — Each wallet withdraws stake from completed habits
 *
 * Config:
 *   - Fee per txn: randomized 2100-2140 microSTX
 *   - Stake per habit: 20,000 microSTX (0.02 STX — contract minimum)
 *   - Delay between txns: 8 seconds
 *   - Wallet count: ACTIVE_WALLETS_COUNT in batch-25-wallets.env (1–55, default 48)
 *
 * Usage:
 *   npx ts-node --project scripts/tsconfig.scripts.json scripts/test/batch-25-executor.ts dry-run
 *   npx ts-node --project scripts/tsconfig.scripts.json scripts/test/batch-25-executor.ts create-habit
 *   npx ts-node --project scripts/tsconfig.scripts.json scripts/test/batch-25-executor.ts check-in
 *   npx ts-node --project scripts/tsconfig.scripts.json scripts/test/batch-25-executor.ts withdraw
 *   npx ts-node --project scripts/tsconfig.scripts.json scripts/test/batch-25-executor.ts status
 *
 * SECURITY: This file is gitignored. NEVER commit to repository.
 */

import {
    makeContractCall,
    broadcastTransaction,
    AnchorMode,
    PostConditionMode,
    fetchNonce,
    uintCV,
    stringUtf8CV,
    getAddressFromPrivateKey,
    cvToJSON,
    fetchCallReadOnlyFunction,
    principalCV,
} from '@stacks/transactions';
import { randomInt } from 'node:crypto';
import { generateWallet, getStxAddress } from '@stacks/wallet-sdk';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createContractReadonlyClient } from '../shared/contract-readonly.ts';
import {
    CHECK_IN_WINDOW_BLOCKS,
    MIN_CHECK_IN_INTERVAL_BLOCKS,
} from '../shared/checkin-timing.ts';
import {
    evaluateDailyCheckInEligibility,
    type CheckInEligibility,
} from '../shared/checkin-eligibility.ts';
import {
    canWithdrawHabit,
    describeWithdrawHabitStatus,
    MIN_STREAK_FOR_WITHDRAWAL,
} from '../shared/streak-sync.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Load wallet config (must come BEFORE constants that read process.env) ──
const envPath = path.join(__dirname, 'batch-25-wallets.env');
if (!fs.existsSync(envPath)) {
    console.error('❌ batch-25-wallets.env not found.');
    console.error('   Create it from batch-25-wallets.env.example');
    console.error('   Then fill in the 55 wallet mnemonics.');
    process.exit(1);
}
dotenv.config({ path: envPath });

// ── Constants ──
const MIN_TX_FEE_MICROSTX = 2_100;
const MAX_TX_FEE_MICROSTX = 2_140;
const ACTIVE_HABIT_LOOKUP_DELAY_MS = 5_000;
const BALANCE_CHECK_DELAY_MS = 800; // delay between per-wallet balance checks to avoid Hiro 429s
const DELAY_BETWEEN_TX_MS = 8_000; // 8 seconds
// How many wallets to include in this batch run (1–55). Edit ACTIVE_WALLETS_COUNT
// in batch-25-wallets.env to use fewer wallets. Default 48 — wallets 49-55 are
// left inactive to stay under Hiro API rate limits and reduce STX burn.
const WALLETS_COUNT = Math.min(
    parseInt(process.env.ACTIVE_WALLETS_COUNT || '48', 10) || 48,
    55, // hard cap at the number of mnemonics configured
);
const HABITS_PER_WALLET = 1;
const TOTAL_TXN_PER_BATCH = WALLETS_COUNT * HABITS_PER_WALLET;
const API_URL = 'https://api.mainnet.hiro.so';
const STAKE_AMOUNT = 20_000; // 0.02 STX — matches habit-tracker-v2 MIN-STAKE-AMOUNT
// Wallets excluded from all batch operations (e.g. persistently failing)
const DISABLED_WALLETS = new Set<number>();

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || 'SP1N3809W9CBWWX04KN3TCQHP8A9GN520BD4JMP8Z';
const CONTRACT_NAME = process.env.CONTRACT_NAME || 'habit-tracker-v2';
const readonlyClient = createContractReadonlyClient({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CONTRACT_NAME,
    mode: 'mainnet',
    baseUrl: API_URL,
});

// ── State tracking file ──
const STATE_FILE = path.join(__dirname, 'batch-25-state.json');

interface WalletInfo {
    index: number;
    address: string;
    privateKey: string;
}

interface HabitRecord {
    walletIndex: number;
    walletAddress: string;
    habitId: number | null;
    habitName: string;
    txId: string;
    feeMicroStx?: number;
    status: 'submitted' | 'failed' | 'confirmed';
    timestamp: number;
    error?: string;
}

interface BatchState {
    createHabitBatch: HabitRecord[];
    checkInBatch: HabitRecord[];
    withdrawBatch: HabitRecord[];
    lastUpdated: number;
}

interface ReadCacheEntry<T> {
    value: T;
    expiresAt: number;
}

const readCache = new Map<string, ReadCacheEntry<unknown>>();
const inFlightReads = new Map<string, Promise<unknown>>();

// ── Utility Functions ──

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function readThroughCache<T>(key: string, ttlMs: number, fetcher: () => Promise<T>): Promise<T> {
    const now = Date.now();
    const cached = readCache.get(key);

    if (cached && cached.expiresAt > now) {
        return cached.value as T;
    }

    const inFlight = inFlightReads.get(key);
    if (inFlight) {
        return inFlight as Promise<T>;
    }

    const request = fetcher()
        .then((value) => {
            readCache.set(key, {
                value,
                expiresAt: Date.now() + ttlMs,
            });
            return value;
        })
        .finally(() => {
            inFlightReads.delete(key);
        });

    inFlightReads.set(key, request);
    return request;
}

function invalidateReadCache(prefix: string): void {
    for (const key of readCache.keys()) {
        if (key.startsWith(prefix)) {
            readCache.delete(key);
        }
    }

    for (const key of inFlightReads.keys()) {
        if (key.startsWith(prefix)) {
            inFlightReads.delete(key);
        }
    }
}

function invalidateWalletReadCaches(walletAddress: string, habitId?: number): void {
    invalidateReadCache(`readonly:user-habits:${walletAddress}`);
    invalidateReadCache(`readonly:user-stats:${walletAddress}`);
    invalidateReadCache(`account:${walletAddress}`);

    if (typeof habitId === 'number') {
        invalidateReadCache(`readonly:habit:${habitId}`);
    }
}

function getRandomizedTxnFeeMicroStx(): number {
    return randomInt(MIN_TX_FEE_MICROSTX, MAX_TX_FEE_MICROSTX + 1);
}

function summarizeSubmittedFees(records: HabitRecord[]): {
    totalFeeMicroStx: number;
    minFeeMicroStx: number | null;
    maxFeeMicroStx: number | null;
} {
    const submittedFees = records
        .filter(record => record.status === 'submitted' && typeof record.feeMicroStx === 'number')
        .map(record => record.feeMicroStx as number);

    if (submittedFees.length === 0) {
        return {
            totalFeeMicroStx: 0,
            minFeeMicroStx: null,
            maxFeeMicroStx: null,
        };
    }

    return {
        totalFeeMicroStx: submittedFees.reduce((sum, fee) => sum + fee, 0),
        minFeeMicroStx: Math.min(...submittedFees),
        maxFeeMicroStx: Math.max(...submittedFees),
    };
}

async function getCurrentBlockHeight(): Promise<number> {
    return readThroughCache('stacks:current-block', 15_000, async () => {
        const response = await fetch(`${API_URL}/v2/info`);

        if (!response.ok) {
            throw new Error(`Failed to fetch current block height: ${response.status} ${response.statusText}`);
        }

        const payload: any = await response.json();
        const currentBlock = Number(payload.stacks_tip_height);

        if (!Number.isFinite(currentBlock)) {
            throw new Error('Stacks API returned an invalid current block height');
        }

        return currentBlock;
    });
}

function loadState(): BatchState {
    const emptyState: BatchState = {
        createHabitBatch: [],
        checkInBatch: [],
        withdrawBatch: [],
        lastUpdated: Date.now(),
    };

    if (fs.existsSync(STATE_FILE)) {
        try {
            const raw = fs.readFileSync(STATE_FILE, 'utf-8').trim();
            if (!raw) return emptyState;
            return JSON.parse(raw);
        } catch {
            console.warn('⚠️  batch-25-state.json is corrupted — starting with fresh state');
            return emptyState;
        }
    }
    return emptyState;
}

function saveState(state: BatchState): void {
    state.lastUpdated = Date.now();
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function describeCheckInEligibility(eligibility: CheckInEligibility): string {
    switch (eligibility.reason) {
        case 'eligible':
            return `eligible with ${eligibility.blocksElapsed} block${eligibility.blocksElapsed === 1 ? '' : 's'} elapsed`;
        case 'too-early':
            return `cooling down for ${eligibility.blocksUntilEligible} more block${eligibility.blocksUntilEligible === 1 ? '' : 's'}`;
        case 'window-expired':
            return `window expired after ${eligibility.blocksElapsed} block${eligibility.blocksElapsed === 1 ? '' : 's'}`;
        case 'inactive':
            return 'inactive on-chain';
        case 'completed':
            return 'already completed on-chain';
        case 'invalid-block-height':
            return 'invalid block height';
        default:
            return eligibility.reason;
    }
}

/**
 * Derive a single wallet from mnemonic using Stacks standard derivation
 * Path: m/44'/5757'/0'/0/0 (same as Leather/Clarinet)
 */
async function deriveWalletFromMnemonic(
    index: number,
    mnemonic: string
): Promise<WalletInfo> {
    const wallet = await generateWallet({
        secretKey: mnemonic,
        password: '',
    });

    const account = wallet.accounts[0];
    if (!account) {
        throw new Error(`Wallet ${index}: failed to derive account from mnemonic`);
    }

    const address = getStxAddress({ account, network: 'mainnet' });

    // Cross-verify: derive address from private key independently
    const verifyAddress = getAddressFromPrivateKey(account.stxPrivateKey, 'mainnet');
    if (address !== verifyAddress) {
        throw new Error(
            `Wallet ${index}: address mismatch — SDK derived ${address} but key derived ${verifyAddress}`
        );
    }

    return {
        index,
        address,
        privateKey: account.stxPrivateKey,
    };
}

/**
 * Load wallets (up to ACTIVE_WALLETS_COUNT) by deriving keys from mnemonics in env file
 */
async function loadWallets(): Promise<WalletInfo[]> {
    const wallets: WalletInfo[] = [];

    for (let i = 1; i <= WALLETS_COUNT; i++) {
        const mnemonic = process.env[`WALLET_${i}_MNEMONIC`];

        if (!mnemonic || mnemonic.trim() === '') {
            console.error(`❌ WALLET_${i}_MNEMONIC not set in batch-25-wallets.env`);
            process.exit(1);
        }

        // Validate word count (BIP39 = 12 or 24 words)
        const words = mnemonic.trim().split(/\s+/);
        if (words.length !== 24 && words.length !== 12) {
            console.error(`❌ WALLET_${i}_MNEMONIC has ${words.length} words (expected 24 or 12)`);
            process.exit(1);
        }

        try {
            const wallet = await deriveWalletFromMnemonic(i, mnemonic.trim());
            wallets.push(wallet);
        } catch (err: any) {
            console.error(`❌ Wallet ${i}: derivation failed — ${err.message}`);
            process.exit(1);
        }
    }

    return wallets;
}

/**
 * Check wallet balance via API with retry logic for rate limits
 */
async function getBalance(address: string): Promise<number> {
    const MAX_ATTEMPTS = 3;
    const BASE_DELAY_MS = 2_000; // Start with 2s, then 4s, then 6s
    
    let lastError: unknown;
    
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            const resp = await fetch(`${API_URL}/v2/accounts/${address}`);
            
            // If rate limited (429), retry with backoff
            if (resp.status === 429) {
                if (attempt < MAX_ATTEMPTS) {
                    const wait = BASE_DELAY_MS * attempt;
                    await sleep(wait);
                    continue;
                }
                throw new Error(`Rate limited after ${MAX_ATTEMPTS} attempts`);
            }
            
            if (!resp.ok) {
                throw new Error(`Balance check failed for ${address}: ${resp.statusText}`);
            }
            
            const data: any = await resp.json();
            // Note: Number() is safe for balances under ~9 billion STX (Number.MAX_SAFE_INTEGER)
            return Number(data.balance);
            
        } catch (err) {
            lastError = err;
            
            // If not rate limit error and not last attempt, retry
            if (attempt < MAX_ATTEMPTS) {
                const wait = BASE_DELAY_MS * attempt;
                await sleep(wait);
                continue;
            }
        }
    }
    
    throw new Error(
        `Balance check failed after ${MAX_ATTEMPTS} attempts: ${
            lastError instanceof Error ? lastError.message : String(lastError)
        }`
    );
}

/**
 * Get account nonce — retries up to 3 times with backoff before giving up.
 * The primary path uses fetchNonce(); each retry also tries the REST fallback
 * so a single SDK hiccup never kills an entire wallet's batch.
 */
async function getNonce(address: string): Promise<bigint> {
    const MAX_ATTEMPTS = 3;
    const BASE_DELAY_MS = 8_000; // matches tx delay so API has time to recover

    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        // Try SDK first
        try {
            return await fetchNonce({ address, network: 'mainnet' });
        } catch (err) {
            lastError = err;
        }

        // Try REST fallback on the same attempt
        try {
            const resp = await fetch(`${API_URL}/v2/accounts/${address}`);
            if (resp.ok) {
                const data: any = await resp.json();
                return BigInt(data.nonce);
            }
        } catch (err) {
            lastError = err;
        }

        if (attempt < MAX_ATTEMPTS) {
            const wait = BASE_DELAY_MS * attempt;
            process.stdout.write(
                `   ⏳ Nonce fetch failed (attempt ${attempt}/${MAX_ATTEMPTS}), retrying in ${wait / 1000}s...\n`
            );
            await sleep(wait);
        }
    }

    throw new Error(
        `Nonce fetch failed after ${MAX_ATTEMPTS} attempts: ${
            lastError instanceof Error ? lastError.message : String(lastError)
        }`
    );
}

/**
 * Get user habits from contract (read-only).
 * get-user-habits returns the full historical habit list for the wallet.
 */
async function getUserHabits(address: string): Promise<number[]> {
    return readThroughCache(`readonly:user-habits:${address}`, 20_000, async () => {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'get-user-habits',
            functionArgs: [principalCV(address)],
            senderAddress: address,
            network: 'mainnet',
        });

        const json = cvToJSON(result);

        // get-user-habits returns a tuple { habit-ids: [...] } directly (not a response)
        // cvToJSON shape: { type: 'tuple', value: { 'habit-ids': { type: 'list', value: [...] } } }
        const habitIdsList = json.value?.['habit-ids']?.value
            ?? json.value?.value  // fallback for response-wrapped shape
            ?? [];
        return Array.isArray(habitIdsList)
            ? habitIdsList.map((v: any) => parseInt(v.value))
            : [];
    });
}

async function getUserHabitsWithRetry(address: string, walletIndex: number): Promise<number[]> {
    const maxAttempts = 4;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await getUserHabits(address);
        } catch (err: any) {
            const message = err instanceof Error ? err.message : String(err);
            const isRateLimit = message.includes('429') || message.includes('Too Many Requests');

            if (!isRateLimit || attempt === maxAttempts) {
                throw new Error(`Wallet ${walletIndex}: get-user-habits lookup failed — ${message}`);
            }

            await sleep(4_000 * attempt);
        }
    }

    throw new Error(`Wallet ${walletIndex}: get-user-habits lookup failed after retries`);
}

/**
 * Get the latest habit ID known for a wallet from local batch state.
 */
function getLatestKnownHabitId(state: BatchState, walletIndex: number): number | null {
    for (let i = state.createHabitBatch.length - 1; i >= 0; i--) {
        const record = state.createHabitBatch[i];
        if (record.walletIndex === walletIndex && record.habitId !== null) {
            return record.habitId;
        }
    }

    return null;
}

/**
 * Read a habit from the contract with retry/backoff when Hiro rate limits us.
 */
async function readHabitWithRetry(habitId: number, walletIndex: number): Promise<NonNullable<Awaited<ReturnType<typeof readonlyClient.getHabit>>>> {
    const maxAttempts = 4;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            const habit = await readThroughCache(`readonly:habit:${habitId}`, 20_000, () => readonlyClient.getHabit(habitId));
            if (!habit) {
                throw new Error(`habit #${habitId} not found`);
            }
            return habit;
        } catch (err: any) {
            const message = err instanceof Error ? err.message : String(err);
            const isRateLimit = message.includes('429') || message.includes('Too Many Requests');

            if (!isRateLimit || attempt === maxAttempts) {
                throw new Error(`Wallet ${walletIndex}: habit #${habitId} lookup failed — ${message}`);
            }

            await sleep(4_000 * attempt);
        }
    }

    throw new Error(`Wallet ${walletIndex}: habit #${habitId} lookup failed after retries`);
}

/**
 * Determine whether a habit is genuinely in-progress (should block new creation).
 *
 * A habit is "truly active" only when ALL of:
 *   1. isActive = true        (not forfeited / expired)
 *   2. isCompleted = false     (not finished / withdrawn)
 *   3. stakeAmount > 0         (stake hasn't been zeroed by withdrawal)
 *
 * After `withdraw-stake`, the contract may leave isActive=true while setting
 * isCompleted=true (or zeroing the stake). The old check only tested isActive,
 * which caused the script to permanently block new habit creation for wallets
 * whose previous habit had been withdrawn on-chain.
 */
function isHabitTrulyActive(habit: { isActive: boolean; isCompleted: boolean; stakeAmount: number }): boolean {
    return habit.isActive && !habit.isCompleted && habit.stakeAmount > 0;
}

/**
 * Get the currently active habit IDs for a wallet.
 *
 * The create-habit workflow only needs the most recent tracked habit in the
 * common one-habit-per-wallet path. We read that habit first to keep the API
 * usage low, then fall back to the historical list only when state is empty.
 */
async function getActiveHabitIdsFromState(state: BatchState, wallet: WalletInfo): Promise<number[]> {
    const latestKnownHabitId = getLatestKnownHabitId(state, wallet.index);

    if (latestKnownHabitId !== null) {
        const habit = await readHabitWithRetry(latestKnownHabitId, wallet.index);
        return isHabitTrulyActive(habit) ? [latestKnownHabitId] : [];
    }

    const habitIds = await getUserHabitsWithRetry(wallet.address, wallet.index);
    if (habitIds.length === 0) {
        return [];
    }

    const latestOnChainHabitId = habitIds[habitIds.length - 1];
    const habit = await readHabitWithRetry(latestOnChainHabitId, wallet.index);
    return isHabitTrulyActive(habit) ? [latestOnChainHabitId] : [];
}

/**
 * Fetch the confirmed habit ID from a create-habit transaction result.
 *
 * The Stacks API returns the Clarity return value in tx_result.repr.
 * For a successful create-habit call this is exactly: (ok u{habitId})
 * We parse that repr to get the precise habit ID — no guessing, no ordering,
 * independent of how many habits the wallet had before.
 *
 * @returns habitId if tx is confirmed+successful, null if still pending,
 *          throws on abort/failure.
 */
async function fetchTxHabitId(txId: string): Promise<number | null> {
    const resp = await fetch(`${API_URL}/extended/v1/tx/${txId}`);
    if (resp.status === 404) {
        return null; // Not yet indexed — transaction is likely still in mempool, retry later
    }
    if (!resp.ok) {
        throw new Error(`TX lookup failed (${resp.status}): ${txId}`);
    }
    const data: any = await resp.json();

    const status: string = data.tx_status;

    if (status === 'pending') {
        return null; // Not yet confirmed
    }

    if (status === 'abort_by_response' || status === 'abort_by_post_condition') {
        throw new Error(`TX aborted (${status}): ${txId}`);
    }

    if (status !== 'success') {
        throw new Error(`TX unexpected status "${status}": ${txId}`);
    }

    // Parse "(ok u302)" → 302
    const repr: string = data.tx_result?.repr ?? '';
    const match = repr.match(/^\(ok u(\d+)\)$/);
    if (!match) {
        throw new Error(`Unexpected tx_result.repr "${repr}" for txId ${txId}`);
    }

    return parseInt(match[1], 10);
}

/**
 * Broadcast a single transaction
 */
async function broadcastTx(
    privateKey: string,
    functionName: string,
    args: any[],
    nonce: bigint,
): Promise<{ txId: string; feeMicroStx: number }> {
    const feeMicroStx = getRandomizedTxnFeeMicroStx();
    const txOptions: any = {
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName,
        functionArgs: args,
        senderKey: privateKey,
        network: 'mainnet',
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        fee: BigInt(feeMicroStx),
        nonce,
    };

    const transaction = await makeContractCall(txOptions);
    const broadcastResponse: any = await broadcastTransaction({ transaction, network: 'mainnet' });

    if (broadcastResponse.error) {
        const errMsg = [broadcastResponse.reason, broadcastResponse.error].filter(Boolean).join(' — ');
        throw new Error(errMsg || JSON.stringify(broadcastResponse));
    }

    return {
        txId: broadcastResponse.txid,
        feeMicroStx,
    };
}

// ═══════════════════════════════════════════════════════════════
// BATCH OPERATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * BATCH 1: Create Habits
 * Each wallet creates 1 habit
 */
async function batchCreateHabits(wallets: WalletInfo[]): Promise<void> {
    const state = loadState();

    console.log('═'.repeat(70));
    console.log(`📝 BATCH CREATE-HABIT — ${WALLETS_COUNT} Wallet${WALLETS_COUNT !== 1 ? 's' : ''} × ${HABITS_PER_WALLET} Habit${HABITS_PER_WALLET !== 1 ? 's' : ''} = ${TOTAL_TXN_PER_BATCH} Transaction${TOTAL_TXN_PER_BATCH !== 1 ? 's' : ''}`);
    console.log('═'.repeat(70));
    console.log();
    console.log(`  Contract: ${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);
    console.log(
        `  Fee/tx:   randomized ${MIN_TX_FEE_MICROSTX}-${MAX_TX_FEE_MICROSTX} microSTX (${(MIN_TX_FEE_MICROSTX / 1_000_000).toFixed(6)}-${(MAX_TX_FEE_MICROSTX / 1_000_000).toFixed(6)} STX)`
    );
    console.log(`  Stake:    ${STAKE_AMOUNT} microSTX (${(STAKE_AMOUNT / 1_000_000).toFixed(4)} STX)`);
    console.log(`  Delay:    ${DELAY_BETWEEN_TX_MS / 1000}s between transactions`);
    console.log(`  Total txns: ${TOTAL_TXN_PER_BATCH}`);
    console.log(`  Est time: ~${Math.ceil((TOTAL_TXN_PER_BATCH * DELAY_BETWEEN_TX_MS) / 60_000)} minutes`);
    console.log();

    // Pre-flight balance checks only apply to wallets that do not currently
    // have an active habit on-chain.
    console.log('💰 Pre-flight Balance Checks...');
    const requiredPerWallet = STAKE_AMOUNT * HABITS_PER_WALLET + MAX_TX_FEE_MICROSTX * HABITS_PER_WALLET;
    const activeHabitIdsByWallet = new Map<number, number[]>();
    let allBalancesSufficient = true;
    let activeHabitLookupFailed = false;
    let walletsToProcess = 0;

    for (const wallet of wallets) {
        // Skip disabled wallets — they cannot check in or withdraw, so creating
        // habits for them would burn the stake.
        if (DISABLED_WALLETS.has(wallet.index)) {
            console.log(`  ⏭️  Wallet ${wallet.index}: disabled — skipping balance check`);
            continue;
        }
        try {
            const activeHabitIds = await getActiveHabitIdsFromState(state, wallet);
            activeHabitIdsByWallet.set(wallet.index, activeHabitIds);

            if (activeHabitIds.length >= HABITS_PER_WALLET) {
                console.log(
                    `  ⏭️  Wallet ${wallet.index} (${wallet.address}): active habit on-chain [${activeHabitIds.join(', ')}] — skipping balance check`
                );
                await sleep(ACTIVE_HABIT_LOOKUP_DELAY_MS);
                continue;
            }

            // Delay after a successful habit lookup that did NOT skip — prevents the
            // subsequent balance check from arriving too quickly after the lookup.
            await sleep(BALANCE_CHECK_DELAY_MS);
        } catch (err: any) {
            console.error(`  ❌ Wallet ${wallet.index} (${wallet.address}): active habit lookup failed — ${err.message}`);
            activeHabitLookupFailed = true;
            await sleep(ACTIVE_HABIT_LOOKUP_DELAY_MS);
            continue;
        }

        walletsToProcess++;
        try {
            const balance = await getBalance(wallet.address);
            if (balance < requiredPerWallet) {
                console.error(`  ❌ Wallet ${wallet.index} (${wallet.address}): ${(balance / 1_000_000).toFixed(4)} STX — needs ${(requiredPerWallet / 1_000_000).toFixed(5)} STX`);
                allBalancesSufficient = false;
            } else {
                console.log(`  ✅ Wallet ${wallet.index} (${wallet.address}): ${(balance / 1_000_000).toFixed(4)} STX`);
            }
            // Delay between balance checks to avoid Hiro API rate limiting (429)
            await sleep(BALANCE_CHECK_DELAY_MS);
        } catch (err: any) {
            // Log error but do NOT set allBalancesSufficient = false for transient
            // API failures (e.g. rate limits). Only insufficient funds should block.
            console.error(`  ⚠️  Wallet ${wallet.index}: balance check failed — ${err.message} (will retry at broadcast time)`);
        }
    }

    if (walletsToProcess === 0) {
        console.log();
        console.log('✅ All eligible wallets already have an active habit on-chain. Nothing to do.');
        console.log('   Withdraw or complete the active habit before creating a new one.');
        return;
    }

    if (activeHabitLookupFailed) {
        console.error();
        console.error('❌ Could not verify active habit state for every wallet due to API rate limits.');
        console.error('   Wait a few minutes and run create-habit again, or reduce ACTIVE_WALLETS_COUNT.');
        process.exit(1);
    }

    if (!allBalancesSufficient) {
        console.error();
        console.error('❌ Some wallets are underfunded. Fund them before proceeding.');
        process.exit(1);
    }

    console.log();
    console.log('⚠️  WARNING: This will execute REAL transactions on mainnet');
    console.log('⚠️  Transactions are IRREVERSIBLE');
    console.log();
    console.log('Starting in 10 seconds... (Ctrl+C to cancel)');
    await sleep(10_000);

    console.log();
    console.log('═'.repeat(70));
    console.log('🎬 CREATE-HABIT BATCH EXECUTION STARTED');
    console.log('═'.repeat(70));
    console.log();

    const results: HabitRecord[] = [];
    let txCount = 0;
    const totalToExecute = walletsToProcess * HABITS_PER_WALLET;

    for (const wallet of wallets) {
        // Skip disabled wallets
        if (DISABLED_WALLETS.has(wallet.index)) {
            continue;
        }

        const activeHabitIds = activeHabitIdsByWallet.get(wallet.index) || [];
        if (activeHabitIds.length >= HABITS_PER_WALLET) {
            console.log(`  ⏭️  Wallet ${wallet.index}: active habit on-chain [${activeHabitIds.join(', ')}] — skipping`);
            continue;
        }

        // Get nonce for this wallet (retries internally)
        let nonce: bigint;
        try {
            nonce = await getNonce(wallet.address);
        } catch (err: any) {
            console.error(`  ❌ Wallet ${wallet.index}: nonce unavailable after retries — ${err.message}`);
            continue;
        }

        for (let h = 1; h <= HABITS_PER_WALLET; h++) {
            txCount++;
            const habitName = `Learning Clarity for 30 days ${h}`;

            console.log(`[${txCount}/${totalToExecute}] Wallet ${wallet.index} — "${habitName}"...`);

            try {
                const { txId, feeMicroStx } = await broadcastTx(
                    wallet.privateKey,
                    'create-habit',
                    [stringUtf8CV(habitName), uintCV(STAKE_AMOUNT)],
                    nonce,
                );

                console.log(`   ✅ ${txId} (fee ${feeMicroStx} microSTX)`);
                console.log(`   🔗 https://explorer.hiro.so/txid/${txId}?chain=mainnet`);

                results.push({
                    walletIndex: wallet.index,
                    walletAddress: wallet.address,
                    habitId: null, // Will be resolved after confirmation
                    habitName,
                    txId,
                    feeMicroStx,
                    status: 'submitted',
                    timestamp: Date.now(),
                });

                invalidateWalletReadCaches(wallet.address);

                nonce = nonce + 1n;
            } catch (err: any) {
                console.log(`   ❌ ${err.message}`);

                results.push({
                    walletIndex: wallet.index,
                    walletAddress: wallet.address,
                    habitId: null,
                    habitName,
                    txId: '',
                    status: 'failed',
                    timestamp: Date.now(),
                    error: err.message,
                });
            }

            // Delay between transactions
            if (txCount < totalToExecute) {
                console.log(`   ⏳ Waiting ${DELAY_BETWEEN_TX_MS / 1000}s...`);
                await sleep(DELAY_BETWEEN_TX_MS);
            }
        }
    }

    // Save state — append so partial re-runs don't lose prior txIds
    state.createHabitBatch = [...state.createHabitBatch, ...results];
    saveState(state);

    // Summary
    const submitted = results.filter(r => r.status === 'submitted').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const feeSummary = summarizeSubmittedFees(results);

    console.log();
    console.log('═'.repeat(70));
    console.log('🎉 CREATE-HABIT BATCH COMPLETE');
    console.log('═'.repeat(70));
    console.log();
    console.log(`  Submitted: ${submitted}/${totalToExecute}`);
    console.log(`  Failed:    ${failed}/${totalToExecute}`);
    console.log(`  Total fee: ${feeSummary.totalFeeMicroStx} microSTX (${(feeSummary.totalFeeMicroStx / 1_000_000).toFixed(6)} STX)`);
    if (feeSummary.minFeeMicroStx !== null && feeSummary.maxFeeMicroStx !== null) {
        console.log(`  Fee range: ${feeSummary.minFeeMicroStx}-${feeSummary.maxFeeMicroStx} microSTX per submitted txn`);
    }
    console.log(`  Total staked: ${((submitted * STAKE_AMOUNT) / 1_000_000).toFixed(4)} STX`);
    console.log();
    console.log(`💾 State saved to: ${STATE_FILE}`);
    console.log();
    console.log('Next step: Wait for confirmations (~10-30 min), then run:');
    console.log('  npx ts-node --project scripts/tsconfig.scripts.json scripts/test/batch-25-executor.ts resolve');
}

/**
 * BATCH 2: Check-In
 * Each wallet checks in on its created habits.
 * Reads habit IDs from state (populated by resolve command).
 */
async function batchCheckIn(wallets: WalletInfo[]): Promise<void> {
    const state = loadState();

    console.log('═'.repeat(70));
    console.log(`🎯 BATCH CHECK-IN — ${WALLETS_COUNT} Wallet${WALLETS_COUNT !== 1 ? 's' : ''} × ${HABITS_PER_WALLET} Habit${HABITS_PER_WALLET !== 1 ? 's' : ''} = ${TOTAL_TXN_PER_BATCH} Transactions`);
    console.log('═'.repeat(70));
    console.log();
    console.log(
        `  Fee/tx: randomized ${MIN_TX_FEE_MICROSTX}-${MAX_TX_FEE_MICROSTX} microSTX (${(MIN_TX_FEE_MICROSTX / 1_000_000).toFixed(6)}-${(MAX_TX_FEE_MICROSTX / 1_000_000).toFixed(6)} STX)`
    );
    console.log(`  Delay:  ${DELAY_BETWEEN_TX_MS / 1000}s between transactions`);
    console.log();

    // Build habit ID map per wallet.
    // Source of truth: confirmed habit IDs from state (populated by `resolve` command).
    // These IDs came directly from each transaction's tx_result — no guessing.
    console.log('🔍 Loading resolved habit IDs from state...');
    const walletHabits: Map<number, number[]> = new Map();
    let needsResolve = false;

    for (const wallet of wallets) {
        if (DISABLED_WALLETS.has(wallet.index)) {
            console.log(`  Wallet ${wallet.index}: ⏭️  skipped (disabled)`);
            walletHabits.set(wallet.index, []);
            continue;
        }
        const confirmedHabits = state.createHabitBatch
            .filter(r => r.walletIndex === wallet.index && r.habitId !== null && r.status === 'confirmed')
            .map(r => r.habitId as number);

        if (confirmedHabits.length >= HABITS_PER_WALLET) {
            walletHabits.set(wallet.index, confirmedHabits.slice(0, HABITS_PER_WALLET));
            console.log(`  Wallet ${wallet.index}: [${confirmedHabits.join(', ')}] ✅`);
        } else if (confirmedHabits.length > 0) {
            walletHabits.set(wallet.index, confirmedHabits);
            console.log(`  ⚠️  Wallet ${wallet.index}: only ${confirmedHabits.length} confirmed habit(s) — [${confirmedHabits.join(', ')}]`);
        } else {
            const pendingCount = state.createHabitBatch.filter(
                r => r.walletIndex === wallet.index && r.status === 'submitted' && r.habitId === null
            ).length;
            if (pendingCount > 0) {
                console.error(`  ❌ Wallet ${wallet.index}: ${pendingCount} txn(s) not yet resolved — run resolve first`);
                needsResolve = true;
            } else {
                console.error(`  ❌ Wallet ${wallet.index}: no habits found — run create-habit first`);
            }
            walletHabits.set(wallet.index, []);
        }
    }

    if (needsResolve) {
        console.error();
        console.error('❌ Some wallets have unresolved habit IDs. Run:');
        console.error('   npx ts-node --project scripts/tsconfig.scripts.json scripts/test/batch-25-executor.ts resolve');
        process.exit(1);
    }

    // Idempotency: only skip habits submitted in the last 10 minutes.
    // This avoids duplicate broadcasts from a crash/re-run while the on-chain
    // eligibility check below enforces the actual 120-144 block window.
    const recentCutoff = Date.now() - 10 * 60 * 1000; // 10 minutes ago

    const alreadyCheckedIn = new Set(
        state.checkInBatch
            .filter(r => r.txId !== '' && r.timestamp >= recentCutoff)
            .map(r => `${r.walletIndex}:${r.habitId}`)
    );
    for (const [walletIdx, ids] of walletHabits) {
        const pending = ids.filter(id => !alreadyCheckedIn.has(`${walletIdx}:${id}`));
        if (pending.length < ids.length) {
            console.log(`  Wallet ${walletIdx}: ${ids.length - pending.length} habit(s) already checked in — skipping`);
        }
        walletHabits.set(walletIdx, pending);
    }

    console.log('🔗 Verifying on-chain check-in eligibility...');
    console.log(`  On-chain window: ${MIN_CHECK_IN_INTERVAL_BLOCKS}-${CHECK_IN_WINDOW_BLOCKS} blocks since the last check-in`);

    const onChainEligibleHabits: Map<number, number[]> = new Map();
    let currentBlockSnapshot: number;

    try {
        currentBlockSnapshot = await getCurrentBlockHeight();
    } catch (err: any) {
        console.error(`  ❌ Unable to fetch current block for eligibility checks — ${err.message}`);
        process.exit(1);
    }

    let walletsSinceLastBlockRefresh = 0;

    for (const wallet of wallets) {
        const habitIds = walletHabits.get(wallet.index) || [];

        if (habitIds.length === 0) {
            onChainEligibleHabits.set(wallet.index, []);
            continue;
        }

        // Refresh every 10 wallets so very large batches stay aligned with chain progress.
        walletsSinceLastBlockRefresh += 1;
        if (walletsSinceLastBlockRefresh >= 10) {
            walletsSinceLastBlockRefresh = 0;
            invalidateReadCache('stacks:current-block');
            try {
                currentBlockSnapshot = await getCurrentBlockHeight();
            } catch (err: any) {
                console.error(`  Wallet ${wallet.index}: unable to refresh current block — ${err.message}`);
            }
        }

        const eligibleIds: number[] = [];

        for (const habitId of habitIds) {
            try {
                const habit = await readonlyClient.getHabit(habitId);

                if (!habit) {
                    console.log(`  Wallet ${wallet.index}: habit #${habitId} not found on-chain — skipping`);
                    continue;
                }

                const eligibility = evaluateDailyCheckInEligibility(habit, currentBlockSnapshot);

                if (!eligibility.eligible) {
                    console.log(`  Wallet ${wallet.index}: habit #${habitId} ${describeCheckInEligibility(eligibility)} — skipping`);
                    continue;
                }

                eligibleIds.push(habitId);
            } catch (err: any) {
                console.error(`  Wallet ${wallet.index}: habit #${habitId} eligibility lookup failed — ${err.message}`);
            }
        }

        if (eligibleIds.length < habitIds.length) {
            console.log(`  Wallet ${wallet.index}: ${habitIds.length - eligibleIds.length} habit(s) skipped after on-chain eligibility check`);
        }

        onChainEligibleHabits.set(wallet.index, eligibleIds);
    }

    for (const [walletIndex, habitIds] of onChainEligibleHabits) {
        walletHabits.set(walletIndex, habitIds);
    }

    // Count total check-ins that are still eligible on-chain
    let totalCheckIns = 0;
    for (const [, ids] of walletHabits) {
        totalCheckIns += ids.length;
    }

    if (totalCheckIns === 0) {
        console.log();
        console.log('✅ No habits are currently eligible for check-in on-chain.');
        console.log(`   Check-ins are only valid between ${MIN_CHECK_IN_INTERVAL_BLOCKS} and ${CHECK_IN_WINDOW_BLOCKS} blocks after the last confirmed check-in.`);
        return;
    }

    console.log();
    console.log(`  Total check-in transactions: ${totalCheckIns}`);
    console.log(`  Est time: ~${Math.ceil((totalCheckIns * DELAY_BETWEEN_TX_MS) / 60_000)} minutes`);
    console.log();
    console.log('⚠️  WARNING: This will execute REAL transactions on mainnet');
    console.log('Starting in 10 seconds... (Ctrl+C to cancel)');
    await sleep(10_000);

    console.log();
    console.log('═'.repeat(70));
    console.log('🎬 CHECK-IN BATCH EXECUTION STARTED');
    console.log('═'.repeat(70));
    console.log();

    const results: HabitRecord[] = [];
    let txCount = 0;

    for (const wallet of wallets) {
        const habitIds = walletHabits.get(wallet.index) || [];
        if (habitIds.length === 0) continue;

        let nonce: bigint;
        try {
            nonce = await getNonce(wallet.address);
        } catch (err: any) {
            console.error(`  ❌ Wallet ${wallet.index}: nonce fetch failed — ${err.message}`);
            continue;
        }

        for (const habitId of habitIds) {
            txCount++;
            console.log(`[${txCount}/${totalCheckIns}] Wallet ${wallet.index} — check-in habit #${habitId}...`);

            try {
                const { txId, feeMicroStx } = await broadcastTx(
                    wallet.privateKey,
                    'check-in',
                    [uintCV(habitId)],
                    nonce,
                );

                console.log(`   ✅ ${txId} (fee ${feeMicroStx} microSTX)`);
                console.log(`   🔗 https://explorer.hiro.so/txid/${txId}?chain=mainnet`);

                results.push({
                    walletIndex: wallet.index,
                    walletAddress: wallet.address,
                    habitId,
                    habitName: '',
                    txId,
                    feeMicroStx,
                    status: 'submitted',
                    timestamp: Date.now(),
                });

                invalidateWalletReadCaches(wallet.address, habitId);

                nonce = nonce + 1n;
            } catch (err: any) {
                console.log(`   ❌ ${err.message}`);

                results.push({
                    walletIndex: wallet.index,
                    walletAddress: wallet.address,
                    habitId,
                    habitName: '',
                    txId: '',
                    status: 'failed',
                    timestamp: Date.now(),
                    error: err.message,
                });
            }

            if (txCount < totalCheckIns) {
                console.log(`   ⏳ Waiting ${DELAY_BETWEEN_TX_MS / 1000}s...`);
                await sleep(DELAY_BETWEEN_TX_MS);
            }
        }
    }

    // Save state
    state.checkInBatch = [...state.checkInBatch, ...results];
    saveState(state);

    const submitted = results.filter(r => r.status === 'submitted').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const feeSummary = summarizeSubmittedFees(results);

    console.log();
    console.log('═'.repeat(70));
    console.log('🎉 CHECK-IN BATCH COMPLETE');
    console.log('═'.repeat(70));
    console.log();
    console.log(`  Submitted: ${submitted}/${totalCheckIns}`);
    console.log(`  Failed:    ${failed}/${totalCheckIns}`);
    console.log(`  Total fee: ${feeSummary.totalFeeMicroStx} microSTX (${(feeSummary.totalFeeMicroStx / 1_000_000).toFixed(6)} STX)`);
    if (feeSummary.minFeeMicroStx !== null && feeSummary.maxFeeMicroStx !== null) {
        console.log(`  Fee range: ${feeSummary.minFeeMicroStx}-${feeSummary.maxFeeMicroStx} microSTX per submitted txn`);
    }
    console.log();
    console.log(`💾 State saved to: ${STATE_FILE}`);
}

/**
 * BATCH 3: Withdraw Stake
 * Each wallet withdraws stake from habits that are still active and have
 * reached the on-chain streak threshold.
 * Requires minimum 7-day streak (MIN-STREAK-FOR-WITHDRAWAL).
 */
async function batchWithdraw(wallets: WalletInfo[]): Promise<void> {
    const state = loadState();

    console.log('═'.repeat(70));
    console.log(`💰 BATCH WITHDRAW — ${WALLETS_COUNT} Wallet${WALLETS_COUNT !== 1 ? 's' : ''} × ${HABITS_PER_WALLET} Habit${HABITS_PER_WALLET !== 1 ? 's' : ''} = ${TOTAL_TXN_PER_BATCH} Transactions`);
    console.log('═'.repeat(70));
    console.log();
    console.log(
        `  Fee/tx: randomized ${MIN_TX_FEE_MICROSTX}-${MAX_TX_FEE_MICROSTX} microSTX (${(MIN_TX_FEE_MICROSTX / 1_000_000).toFixed(6)}-${(MAX_TX_FEE_MICROSTX / 1_000_000).toFixed(6)} STX)`
    );
    console.log(`  Delay:  ${DELAY_BETWEEN_TX_MS / 1000}s between transactions`);
    console.log(`  ⚠️  Requires min ${MIN_STREAK_FOR_WITHDRAWAL}-day streak per habit`);
    console.log();

    // Resolve habit IDs from confirmed state (IDs extracted from tx_result by resolve command).
    console.log('🔍 Loading resolved habit IDs from state...');
    const walletHabits: Map<number, number[]> = new Map();
    let needsResolve = false;

    for (const wallet of wallets) {
        if (DISABLED_WALLETS.has(wallet.index)) {
            console.log(`  Wallet ${wallet.index}: ⏭️  skipped (disabled)`);
            walletHabits.set(wallet.index, []);
            continue;
        }
        const confirmedHabits = state.createHabitBatch
            .filter(r => r.walletIndex === wallet.index && r.habitId !== null && r.status === 'confirmed')
            .map(r => r.habitId as number);

        if (confirmedHabits.length >= HABITS_PER_WALLET) {
            walletHabits.set(wallet.index, confirmedHabits.slice(0, HABITS_PER_WALLET));
            console.log(`  Wallet ${wallet.index}: [${confirmedHabits.join(', ')}] ✅`);
        } else if (confirmedHabits.length > 0) {
            walletHabits.set(wallet.index, confirmedHabits);
            console.log(`  ⚠️  Wallet ${wallet.index}: only ${confirmedHabits.length} confirmed habit(s) — [${confirmedHabits.join(', ')}]`);
        } else {
            const pendingCount = state.createHabitBatch.filter(
                r => r.walletIndex === wallet.index && r.status === 'submitted' && r.habitId === null
            ).length;
            if (pendingCount > 0) {
                console.error(`  ❌ Wallet ${wallet.index}: txns not yet resolved — run resolve first`);
                needsResolve = true;
            } else {
                console.error(`  ❌ Wallet ${wallet.index}: no habits found — run create-habit first`);
            }
            walletHabits.set(wallet.index, []);
        }
    }

    if (needsResolve) {
        console.error();
        console.error('❌ Some wallets have unresolved habit IDs. Run:');
        console.error('   npx ts-node --project scripts/tsconfig.scripts.json scripts/test/batch-25-executor.ts resolve');
        process.exit(1);
    }

    // Idempotency: skip any habit IDs already successfully submitted in a prior run
    const alreadyWithdrawn = new Set(
        state.withdrawBatch
            .filter(r => r.txId !== '')
            .map(r => `${r.walletIndex}:${r.habitId}`)
    );
    for (const [walletIdx, ids] of walletHabits) {
        const pending = ids.filter(id => !alreadyWithdrawn.has(`${walletIdx}:${id}`));
        if (pending.length < ids.length) {
            console.log(`  Wallet ${walletIdx}: ${ids.length - pending.length} habit(s) already withdrawn — skipping`);
        }
        walletHabits.set(walletIdx, pending);
    }

    console.log('🔗 Verifying on-chain withdrawal eligibility...');

    const onChainEligibleWithdrawals: Map<number, number[]> = new Map();
    for (const wallet of wallets) {
        const habitIds = walletHabits.get(wallet.index) || [];

        if (habitIds.length === 0) {
            onChainEligibleWithdrawals.set(wallet.index, []);
            continue;
        }

        const eligibleIds: number[] = [];

        for (const habitId of habitIds) {
            try {
                const habit = await readonlyClient.getHabit(habitId);

                if (!habit) {
                    console.log(`  Wallet ${wallet.index}: habit #${habitId} not found on-chain — skipping`);
                    continue;
                }

                if (!canWithdrawHabit(habit)) {
                    console.log(`  Wallet ${wallet.index}: habit #${habitId} ${describeWithdrawHabitStatus(habit)} — skipping`);
                    continue;
                }

                eligibleIds.push(habitId);
            } catch (err: any) {
                console.error(`  Wallet ${wallet.index}: habit #${habitId} withdrawability lookup failed — ${err.message}`);
            }
        }

        if (eligibleIds.length < habitIds.length) {
            console.log(`  Wallet ${wallet.index}: ${habitIds.length - eligibleIds.length} habit(s) skipped after on-chain withdrawal check`);
        }

        onChainEligibleWithdrawals.set(wallet.index, eligibleIds);
    }

    for (const [walletIndex, habitIds] of onChainEligibleWithdrawals) {
        walletHabits.set(walletIndex, habitIds);
    }

    let totalWithdrawals = 0;
    for (const [, ids] of walletHabits) {
        totalWithdrawals += ids.length;
    }

    if (totalWithdrawals === 0) {
        console.log();
        console.log('✅ No habits are currently eligible for withdrawal on-chain.');
        console.log(`   A habit needs an active on-chain streak of at least ${MIN_STREAK_FOR_WITHDRAWAL} before withdrawal.`);
        return;
    }

    console.log();
    console.log(`  Total withdraw transactions: ${totalWithdrawals}`);
    console.log(`  Est time: ~${Math.ceil((totalWithdrawals * DELAY_BETWEEN_TX_MS) / 60_000)} minutes`);
    console.log();
    console.log('⚠️  WARNING: This will execute REAL withdrawal transactions on mainnet');
    console.log('Starting in 10 seconds... (Ctrl+C to cancel)');
    await sleep(10_000);

    console.log();
    console.log('═'.repeat(70));
    console.log('🎬 WITHDRAW BATCH EXECUTION STARTED');
    console.log('═'.repeat(70));
    console.log();

    const results: HabitRecord[] = [];
    let txCount = 0;

    for (const wallet of wallets) {
        const habitIds = walletHabits.get(wallet.index) || [];
        if (habitIds.length === 0) continue;

        let nonce: bigint;
        try {
            nonce = await getNonce(wallet.address);
        } catch (err: any) {
            console.error(`  ❌ Wallet ${wallet.index}: nonce fetch failed — ${err.message}`);
            continue;
        }

        for (const habitId of habitIds) {
            txCount++;
            console.log(`[${txCount}/${totalWithdrawals}] Wallet ${wallet.index} — withdraw habit #${habitId}...`);

            try {
                const { txId, feeMicroStx } = await broadcastTx(
                    wallet.privateKey,
                    'withdraw-stake',
                    [uintCV(habitId)],
                    nonce,
                );

                console.log(`   ✅ ${txId} (fee ${feeMicroStx} microSTX)`);
                console.log(`   🔗 https://explorer.hiro.so/txid/${txId}?chain=mainnet`);

                results.push({
                    walletIndex: wallet.index,
                    walletAddress: wallet.address,
                    habitId,
                    habitName: '',
                    txId,
                    feeMicroStx,
                    status: 'submitted',
                    timestamp: Date.now(),
                });

                invalidateWalletReadCaches(wallet.address, habitId);

                nonce = nonce + 1n;
            } catch (err: any) {
                console.log(`   ❌ ${err.message}`);

                results.push({
                    walletIndex: wallet.index,
                    walletAddress: wallet.address,
                    habitId,
                    habitName: '',
                    txId: '',
                    status: 'failed',
                    timestamp: Date.now(),
                    error: err.message,
                });
            }

            if (txCount < totalWithdrawals) {
                console.log(`   ⏳ Waiting ${DELAY_BETWEEN_TX_MS / 1000}s...`);
                await sleep(DELAY_BETWEEN_TX_MS);
            }
        }
    }

    state.withdrawBatch = [...state.withdrawBatch, ...results];
    saveState(state);

    const submitted = results.filter(r => r.status === 'submitted').length;
    const failed = results.filter(r => r.status === 'failed').length;
    const feeSummary = summarizeSubmittedFees(results);

    console.log();
    console.log('═'.repeat(70));
    console.log('🎉 WITHDRAW BATCH COMPLETE');
    console.log('═'.repeat(70));
    console.log();
    console.log(`  Submitted: ${submitted}/${totalWithdrawals}`);
    console.log(`  Failed:    ${failed}/${totalWithdrawals}`);
    console.log(`  Total fee: ${feeSummary.totalFeeMicroStx} microSTX (${(feeSummary.totalFeeMicroStx / 1_000_000).toFixed(6)} STX)`);
    if (feeSummary.minFeeMicroStx !== null && feeSummary.maxFeeMicroStx !== null) {
        console.log(`  Fee range: ${feeSummary.minFeeMicroStx}-${feeSummary.maxFeeMicroStx} microSTX per submitted txn`);
    }
    console.log();
    console.log(`💾 State saved to: ${STATE_FILE}`);
}

/**
 * STATUS: Show current state of all batches
 */
async function showStatus(wallets: WalletInfo[]): Promise<void> {
    const state = loadState();

    console.log('═'.repeat(70));
    console.log(`📊 ${WALLETS_COUNT}-WALLET BATCH STATUS`);
    console.log('═'.repeat(70));
    console.log();

    // Show wallet summary
    console.log('🔐 Wallets');
    console.log('──────────────────────────────────────────────────────────────');
    for (const wallet of wallets) {
        try {
            const balance = await getBalance(wallet.address);
            console.log(`  ${wallet.index.toString().padStart(2, '0')}. ${wallet.address} — ${(balance / 1_000_000).toFixed(4)} STX`);
        } catch {
            console.log(`  ${wallet.index.toString().padStart(2, '0')}. ${wallet.address} — balance unavailable`);
        }
        // Rate-limit: delay between per-wallet balance lookups to avoid Hiro 429s
        await sleep(BALANCE_CHECK_DELAY_MS);
    }
    console.log();

    console.log('🔗 On-chain streak sync');
    console.log(`  Check-in window: ${MIN_CHECK_IN_INTERVAL_BLOCKS}-${CHECK_IN_WINDOW_BLOCKS} blocks after the last check-in`);
    console.log(`  Withdrawal threshold: ${MIN_STREAK_FOR_WITHDRAWAL} consecutive days`);
    console.log();

    // Create-habit batch
    if (state.createHabitBatch.length > 0) {
        const submitted = state.createHabitBatch.filter(r => r.status === 'submitted').length;
        const failed = state.createHabitBatch.filter(r => r.status === 'failed').length;
        console.log('📝 Create-Habit Batch');
        console.log(`  Submitted: ${submitted} | Failed: ${failed} | Total: ${state.createHabitBatch.length}`);
    } else {
        console.log('📝 Create-Habit Batch: Not yet run');
    }

    // Check-in batch
    if (state.checkInBatch.length > 0) {
        const submitted = state.checkInBatch.filter(r => r.status === 'submitted').length;
        const failed = state.checkInBatch.filter(r => r.status === 'failed').length;
        console.log('🎯 Check-In Batch');
        console.log(`  Submitted: ${submitted} | Failed: ${failed} | Total: ${state.checkInBatch.length}`);
    } else {
        console.log('🎯 Check-In Batch: Not yet run');
    }

    // Withdraw batch
    if (state.withdrawBatch.length > 0) {
        const submitted = state.withdrawBatch.filter(r => r.status === 'submitted').length;
        const failed = state.withdrawBatch.filter(r => r.status === 'failed').length;
        console.log('💰 Withdraw Batch');
        console.log(`  Submitted: ${submitted} | Failed: ${failed} | Total: ${state.withdrawBatch.length}`);
    } else {
        console.log('💰 Withdraw Batch: Not yet run');
    }

    console.log();
    console.log(`Last updated: ${new Date(state.lastUpdated).toISOString()}`);
}

/**
 * RESOLVE: Auto-extract habit IDs from create-habit transaction results.
 *
 * Strategy (in order of reliability):
 *   1. For each submitted create-habit record that still has habitId=null,
 *      query GET /extended/v1/tx/{txId}. The API returns tx_result.repr
 *      which contains exactly "(ok u{habitId})" — the Clarity return value.
 *      Parse that to get the precise habit ID with zero ambiguity.
 *   2. If a tx is still pending, report it and skip (run resolve again later).
 *   3. Fallback only for records without a txId: query get-user-habits on-chain
 *      and diff against already-resolved IDs.
 *
 * This approach works regardless of:
 *   - How many habits the wallet had before this batch
 *   - Other users creating habits concurrently on the contract
 *   - Multiple separate batch runs from the same wallet
 *   - The order in which transactions were confirmed
 */
async function resolveHabitIds(_wallets: WalletInfo[]): Promise<void> {
    const state = loadState();

    console.log('═'.repeat(70));
    console.log('🔍 AUTO-RESOLVING HABIT IDs FROM TRANSACTION RESULTS');
    console.log('═'.repeat(70));
    console.log();
    console.log('  Method: parse tx_result.repr from each create-habit txId');
    console.log('  Each confirmed transaction embeds the exact returned habit ID.');
    console.log();

    const unresolved = state.createHabitBatch.filter(
        r => r.habitId === null && r.txId !== '' && r.status !== 'confirmed'
    );
    const noTxId = state.createHabitBatch.filter(
        r => r.habitId === null && r.txId === ''
    );
    const alreadyResolved = state.createHabitBatch.filter(r => r.habitId !== null);

    console.log(`  Already resolved: ${alreadyResolved.length}`);
    console.log(`  To resolve now:   ${unresolved.length}`);
    console.log(`  Failed/no txId:   ${noTxId.length}`);
    console.log();

    if (unresolved.length === 0 && alreadyResolved.length === 0) {
        console.log('❌ No create-habit records found. Run create-habit batch first.');
        return;
    }

    let resolved = 0;
    let pending = 0;
    let errored = 0;

    for (const record of unresolved) {
        process.stdout.write(
            `  Wallet ${record.walletIndex} "${record.habitName}" (${record.txId.slice(0, 12)}...)  `
        );

        try {
            const habitId = await fetchTxHabitId(record.txId);

            if (habitId === null) {
                console.log('⏳ pending');
                pending++;
            } else {
                record.habitId = habitId;
                record.status = 'confirmed';
                record.error = undefined; // clear any stale error from a prior failed lookup
                console.log(`✅ habit #${habitId}`);
                resolved++;
            }
        } catch (err: any) {
            console.log(`❌ ${err.message}`);
            // Only mark as permanently failed for confirmed on-chain aborts.
            // Transient API errors should remain retryable on the next resolve run.
            if (err.message.includes('TX aborted')) {
                record.status = 'failed';
            }
            record.error = err.message;
            errored++;
        }

        // Rate-limit: 1.5s between API calls to stay under Hiro's ~50 req/min limit
        await sleep(1_500);

        // Save incrementally so progress survives crashes
        if (resolved % 5 === 0 && resolved > 0) {
            saveState(state);
        }
    }

    saveState(state);

    console.log();
    console.log('──────────────────────────────────────────────────────────────');
    console.log(`  Resolved this run: ${resolved}`);
    if (pending > 0)  console.log(`  Still pending:     ${pending}  (run resolve again after ~10 min)`);
    if (errored > 0)  console.log(`  Errors/aborted:    ${errored}`);
    console.log(`  Total resolved:    ${alreadyResolved.length + resolved}/${state.createHabitBatch.length}`);
    console.log();

    if (pending > 0) {
        console.log('Some transactions are still pending (not yet mined into a block).');
        console.log('Wait ~10 minutes and run resolve again:');
        console.log('  npx ts-node --project scripts/tsconfig.scripts.json scripts/test/batch-25-executor.ts resolve');
    } else if (alreadyResolved.length + resolved === state.createHabitBatch.filter(r => r.status !== 'failed').length) {
        console.log('✅ All habit IDs resolved. Ready for check-in batch:');
        console.log('  npx ts-node --project scripts/tsconfig.scripts.json scripts/test/batch-25-executor.ts check-in');
    }

    console.log();
    console.log(`💾 State saved: ${STATE_FILE}`);
}

/**
 * RECOVER: Patch failed/no-txId records using on-chain get-user-habits.
 *
 * Use this when create-habit transactions landed on-chain but were recorded
 * as failed in state (e.g. broadcast response timed out, nonce error logged
 * but tx still propagated). The function:
 *   1. Queries get-user-habits for each wallet with unresolved failed records
 *   2. Subtracts habit IDs already confirmed in state
 *   3. Assigns the remaining on-chain IDs to the failed records for that wallet
 *
 * IMPORTANT: This works correctly ONLY when the number of unresolved failed
 * records per wallet exactly matches the number of extra on-chain habits found.
 * If a wallet has 1 failed record and 1 extra on-chain habit, it patches it.
 * If counts don't match, it reports the mismatch and skips that wallet.
 */
async function recoverHabitIds(wallets: WalletInfo[]): Promise<void> {
    const state = loadState();

    console.log('═'.repeat(70));
    console.log('🔧 RECOVER HABIT IDs — On-chain Fallback for Failed Records');
    console.log('═'.repeat(70));
    console.log();
    console.log('  Queries get-user-habits on-chain for wallets with failed records.');
    console.log('  Assigns unrecognised on-chain habit IDs to unresolved state entries.');
    console.log();

    const failedRecords = state.createHabitBatch.filter(
        r => r.habitId === null && (r.txId === '' || r.status === 'failed')
    );

    if (failedRecords.length === 0) {
        console.log('✅ No failed/unresolved records found. Nothing to recover.');
        return;
    }

    console.log(`  Failed/no-txId records to recover: ${failedRecords.length}`);
    console.log();

    // Group failed records by walletIndex
    const failedByWallet = new Map<number, HabitRecord[]>();
    for (const r of failedRecords) {
        if (!failedByWallet.has(r.walletIndex)) failedByWallet.set(r.walletIndex, []);
        failedByWallet.get(r.walletIndex)!.push(r);
    }

    // Build set of already-confirmed habit IDs (globally, to avoid any double-assign)
    const confirmedIds = new Set<number>(
        state.createHabitBatch
            .filter(r => r.habitId !== null)
            .map(r => r.habitId as number)
    );

    let totalRecovered = 0;
    let totalSkipped = 0;

    for (const [walletIndex, walletFailedRecords] of failedByWallet) {
        const wallet = wallets.find(w => w.index === walletIndex);
        if (!wallet) {
            console.log(`  ⚠️  Wallet ${walletIndex}: not found in loaded wallets — skipping`);
            totalSkipped += walletFailedRecords.length;
            continue;
        }

        process.stdout.write(`  Wallet ${walletIndex} (${wallet.address.slice(0, 12)}...)  `);

        try {
            const onChainHabits = await getUserHabits(wallet.address);

            // Find habit IDs that are on-chain but not yet in confirmed state
            const newIds = onChainHabits.filter(id => !confirmedIds.has(id));

            if (newIds.length === 0) {
                console.log(`❓ ${walletFailedRecords.length} failed record(s) but no extra on-chain habits found`);
                totalSkipped += walletFailedRecords.length;
                continue;
            }

            if (newIds.length !== walletFailedRecords.length) {
                console.log(
                    `⚠️  Mismatch: ${walletFailedRecords.length} failed record(s) but ${newIds.length} extra on-chain habit(s) found [${newIds.join(', ')}] — skipping to avoid wrong assignment`
                );
                totalSkipped += walletFailedRecords.length;
                continue;
            }

            // Counts match — assign IDs (sorted ascending to match creation order)
            newIds.sort((a, b) => a - b);
            for (let i = 0; i < walletFailedRecords.length; i++) {
                walletFailedRecords[i].habitId = newIds[i];
                walletFailedRecords[i].status = 'confirmed';
                walletFailedRecords[i].error = undefined;
                confirmedIds.add(newIds[i]);
            }

            console.log(`✅ recovered habit ID(s): [${newIds.join(', ')}]`);
            totalRecovered += walletFailedRecords.length;

        } catch (err: any) {
            console.log(`❌ on-chain query failed: ${err.message}`);
            totalSkipped += walletFailedRecords.length;
        }
    }

    saveState(state);

    console.log();
    console.log('──────────────────────────────────────────────────────────────');
    console.log(`  Recovered: ${totalRecovered}`);
    if (totalSkipped > 0) console.log(`  Skipped:   ${totalSkipped}  (manual intervention needed)`);
    const totalResolved = state.createHabitBatch.filter(r => r.habitId !== null).length;
    console.log(`  Total resolved: ${totalResolved}/${state.createHabitBatch.length}`);
    console.log();

    if (totalSkipped > 0) {
        console.log('⚠️  Some records could not be automatically recovered.');
        console.log('   Check the explorer for those wallet addresses to find habit IDs manually,');
        console.log('   then edit batch-25-state.json directly.');
        console.log(`   Explorer: https://explorer.hiro.so/address/{wallet}?chain=mainnet`);
    } else {
        console.log('✅ All recovered. Ready for check-in batch:');
        console.log('  npx ts-node --project scripts/tsconfig.scripts.json scripts/test/batch-25-executor.ts check-in');
    }

    console.log();
    console.log(`💾 State saved: ${STATE_FILE}`);
}

/**
 * DRY-RUN TEST: Comprehensive pre-flight validation
 * 
 * Tests (per wallet):
 *   1. Mnemonic format (24 words)
 *   2. Key derivation from mnemonic
 *   3. Address derivation cross-verification
 *   4. Network connectivity
 *   5. Contract reachability (read-only call)
 *   6. Wallet balance sufficient for create-habit batch
 *   7. Account nonce readable
 *   8. No duplicate addresses across wallets
 *   9. Git protection (.gitignore covers sensitive files)
 * 
 * Exit code 0 = all pass, 1 = any failure
 */
async function dryRunTest(): Promise<void> {
    console.log('═'.repeat(70));
    console.log(`🧪 DRY-RUN TEST — ${WALLETS_COUNT}-Wallet Batch Validation`);
    console.log('═'.repeat(70));
    console.log();
    console.log('This test validates ALL configuration WITHOUT executing transactions.');
    console.log('Run this BEFORE any batch operation to prevent failed transactions.');
    console.log();

    let totalTests = 0;
    let passed = 0;
    let failed = 0;
    const failures: string[] = [];

    function pass(msg: string) {
        totalTests++;
        passed++;
        console.log(`   ✅ ${msg}`);
    }

    function fail(msg: string) {
        totalTests++;
        failed++;
        failures.push(msg);
        console.log(`   ❌ ${msg}`);
    }

    // ── Test 1: Environment File ──
    console.log('[1/9] Environment file...');
    if (fs.existsSync(envPath)) {
        pass('batch-25-wallets.env exists');
    } else {
        fail('batch-25-wallets.env NOT found');
        console.log();
        console.error('Cannot continue. Create the file from scripts/test/batch-25-wallets.env.example');
        process.exit(1);
    }

    // ── Test 2: Contract Configuration ──
    console.log('[2/9] Contract configuration...');
    if (CONTRACT_ADDRESS && CONTRACT_NAME) {
        pass(`Contract: ${CONTRACT_ADDRESS}.${CONTRACT_NAME}`);
    } else {
        fail('CONTRACT_ADDRESS or CONTRACT_NAME not set');
    }

    // ── Test 3: Mnemonic Format + Key Derivation ──
    console.log(`[3/9] Mnemonic validation & key derivation (${WALLETS_COUNT} wallets)...`);
    const wallets: WalletInfo[] = [];
    const derivationErrors: string[] = [];

    for (let i = 1; i <= WALLETS_COUNT; i++) {
        const mnemonic = process.env[`WALLET_${i}_MNEMONIC`];

        if (!mnemonic || mnemonic.trim() === '') {
            fail(`Wallet ${i}: WALLET_${i}_MNEMONIC is empty`);
            derivationErrors.push(`Wallet ${i}: empty mnemonic`);
            continue;
        }

        const words = mnemonic.trim().split(/\s+/);
        if (words.length !== 24 && words.length !== 12) {
            fail(`Wallet ${i}: ${words.length} words (expected 24 or 12)`);
            derivationErrors.push(`Wallet ${i}: bad word count`);
            continue;
        }

        try {
            const wallet = await deriveWalletFromMnemonic(i, mnemonic.trim());
            wallets.push(wallet);
            pass(`Wallet ${i}: ${wallet.address} (key: ${wallet.privateKey.length} hex chars)`);
        } catch (err: any) {
            fail(`Wallet ${i}: derivation failed — ${err.message}`);
            derivationErrors.push(`Wallet ${i}: ${err.message}`);
        }
    }

    if (wallets.length === 0) {
        console.log();
        console.error('❌ No wallets could be derived. Fix mnemonics before proceeding.');
        process.exit(1);
    }

    // ── Test 4: Address Cross-Verification (already done in deriveWalletFromMnemonic) ──
    console.log('[4/9] Address cross-verification...');
    let crossVerifyPassed = true;
    for (const w of wallets) {
        const recheck = getAddressFromPrivateKey(w.privateKey, 'mainnet');
        if (recheck !== w.address) {
            fail(`Wallet ${w.index}: address mismatch (${w.address} vs ${recheck})`);
            crossVerifyPassed = false;
        }
    }
    if (crossVerifyPassed) {
        pass(`All ${wallets.length} wallet addresses verified (SDK ↔ key derivation match)`);
    }

    // ── Test 5: Duplicate Address Check ──
    console.log('[5/9] Duplicate address detection...');
    const addressSet = new Set<string>();
    let hasDuplicates = false;
    for (const w of wallets) {
        if (addressSet.has(w.address)) {
            fail(`Wallet ${w.index}: DUPLICATE address ${w.address}`);
            hasDuplicates = true;
        }
        addressSet.add(w.address);
    }
    if (!hasDuplicates) {
        pass(`All ${wallets.length} addresses are unique`);
    }

    // ── Test 6: Network Connectivity ──
    console.log('[6/9] Network connectivity...');
    try {
        const resp = await fetch(`${API_URL}/v2/info`);
        if (resp.ok) {
            pass(`Stacks mainnet API reachable (${API_URL})`);
        } else {
            fail(`API returned ${resp.status}: ${resp.statusText}`);
        }
    } catch (err: any) {
        fail(`Network unreachable: ${err.message}`);
    }

    // ── Test 7: Contract Reachability (read-only call) ──
    console.log('[7/9] Contract reachability (get-total-habits)...');
    try {
        const result = await fetchCallReadOnlyFunction({
            contractAddress: CONTRACT_ADDRESS,
            contractName: CONTRACT_NAME,
            functionName: 'get-total-habits',
            functionArgs: [],
            senderAddress: CONTRACT_ADDRESS,
            network: 'mainnet',
        });
        const json = cvToJSON(result);
        const totalHabits = json.value?.value ?? json.value ?? 'unknown';
        pass(`Contract responds — total habits: ${totalHabits}`);
    } catch (err: any) {
        fail(`Contract call failed: ${err.message}`);
    }

    // ── Test 8: Balance & Nonce Checks ──
    console.log('[8/9] Balance & nonce check (per wallet)...');
    const requiredPerWallet = STAKE_AMOUNT * HABITS_PER_WALLET + MAX_TX_FEE_MICROSTX * HABITS_PER_WALLET;
    let allFunded = true;

    for (const w of wallets) {
        try {
            const balance = await getBalance(w.address);
            const nonce = await getNonce(w.address);

            if (balance >= requiredPerWallet) {
                pass(`Wallet ${w.index}: ${(balance / 1_000_000).toFixed(4)} STX, nonce=${nonce}`);
            } else {
                fail(`Wallet ${w.index}: ${(balance / 1_000_000).toFixed(4)} STX — needs ${(requiredPerWallet / 1_000_000).toFixed(5)} STX`);
                allFunded = false;
            }
        } catch (err: any) {
            fail(`Wallet ${w.index}: API error — ${err.message}`);
            allFunded = false;
        }
        // Rate-limit: avoid Hiro API throttling on 55-wallet check
        await sleep(200);
    }

    // ── Test 9: Git Protection ──
    console.log('[9/9] Git protection (.gitignore)...');
    const gitignorePath = path.join(process.cwd(), '.gitignore');
    if (fs.existsSync(gitignorePath)) {
        const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
        const criticalPatterns = [
            { pattern: 'scripts/test/', desc: 'test/ automation folder (mnemonics, state, env)' },
            { pattern: 'settings/*.toml', desc: 'settings/Mainnet.toml (wallet mnemonics)' },
        ];
        for (const { pattern, desc } of criticalPatterns) {
            if (gitignore.includes(pattern)) {
                pass(`Protected: ${desc}`);
            } else {
                fail(`NOT in .gitignore: ${desc} — SECURITY RISK`);
            }
        }
    } else {
        fail('.gitignore not found — ALL files at risk');
    }

    // ── Summary ──
    console.log();
    console.log('═'.repeat(70));
    if (failed === 0) {
        console.log('🎉 DRY-RUN PASSED — All tests passed');
    } else {
        console.log('⚠️  DRY-RUN FAILED — Some tests failed');
    }
    console.log('═'.repeat(70));
    console.log();
    console.log(`  Total tests: ${totalTests}`);
    console.log(`  Passed:      ${passed}`);
    console.log(`  Failed:      ${failed}`);
    console.log();

    if (failures.length > 0) {
        console.log('❌ Failures:');
        for (const f of failures) {
            console.log(`   • ${f}`);
        }
        console.log();
    }

    if (failed === 0) {
        console.log('✅ Safe to execute batch operations.');
        console.log('   Next: npx ts-node --project scripts/tsconfig.scripts.json scripts/test/batch-25-executor.ts create-habit');
    } else {
        console.log('🛑 Fix the failures above before running batch operations.');
    }

    process.exit(failed > 0 ? 1 : 0);
}

// ═══════════════════════════════════════════════════════════════
// MAIN CLI
// ═══════════════════════════════════════════════════════════════

async function main() {
    const command = process.argv[2];

    if (!command) {
        console.log('Usage:');
        console.log('  npx ts-node --project scripts/tsconfig.scripts.json scripts/test/batch-25-executor.ts <command>');
        console.log();
        console.log('Commands:');
        console.log('  dry-run       — Validate all mnemonics, derivation, balances, nonces (run first)');
        console.log(`  create-habit  — Each wallet creates ${HABITS_PER_WALLET} habit${HABITS_PER_WALLET !== 1 ? 's' : ''} (${TOTAL_TXN_PER_BATCH} txns)`);
        console.log(`  check-in      — Each wallet checks in on on-chain eligible habits (${TOTAL_TXN_PER_BATCH} txns)`);
        console.log(`  withdraw      — Each wallet withdraws stake from on-chain eligible habits (${TOTAL_TXN_PER_BATCH} txns)`);
        console.log('  resolve       — Query on-chain habit IDs and update local state');
        console.log('  status        — Show batch execution status & balances');
        console.log();
        console.log('Workflow:');
        console.log('  1. dry-run       → validate everything first');
        console.log('  2. create-habit  → wait for confirmations');
        console.log('  3. resolve       → map habit IDs');
        console.log(`  4. check-in      → run daily when the contract reports ${MIN_CHECK_IN_INTERVAL_BLOCKS}-${CHECK_IN_WINDOW_BLOCKS} eligible blocks`);
        console.log(`  5. withdraw      → after ${MIN_STREAK_FOR_WITHDRAWAL}+ day streak confirmed on-chain`);
        process.exit(0);
    }

    // dry-run handles its own wallet loading (to report per-wallet errors)
    if (command === 'dry-run') {
        await dryRunTest();
        return;
    }

    // Load wallets (derives keys from mnemonics)
    console.log(`🔐 Loading ${WALLETS_COUNT} wallet${WALLETS_COUNT !== 1 ? 's' : ''} (deriving keys from mnemonics, wallets 1-${WALLETS_COUNT})...`);
    const wallets = await loadWallets();
    console.log(`   ✅ ${wallets.length} wallets derived and verified`);
    console.log();

    switch (command) {
        case 'create-habit':
            await batchCreateHabits(wallets);
            break;
        case 'check-in':
            await batchCheckIn(wallets);
            break;
        case 'withdraw':
            await batchWithdraw(wallets);
            break;
        case 'resolve':
            await resolveHabitIds(wallets);
            break;
        case 'recover':
            await recoverHabitIds(wallets);
            break;
        case 'status':
            await showStatus(wallets);
            break;
        default:
            console.error(`❌ Unknown command: ${command}`);
            console.error('   Valid commands: dry-run, create-habit, check-in, withdraw, resolve, recover, status');
            process.exit(1);
    }
}

main().catch(error => {
    console.error();
    console.error('💥 FATAL ERROR:', error.message);
    console.error();
    process.exit(1);
});
