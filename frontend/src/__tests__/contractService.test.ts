import { describe, it, expect, vi, beforeEach } from 'vitest';

// Capture the options passed to showContractCall so we can invoke callbacks
let capturedOptions: any = null;
vi.mock('@stacks/connect', () => ({
  showContractCall: (opts: any) => {
    capturedOptions = opts;
  },
}));

vi.mock('@stacks/transactions', () => ({
  uintCV: (v: number) => ({ type: 'uint', value: v }),
  stringUtf8CV: (v: string) => ({ type: 'string-utf8', value: v }),
  principalCV: (v: string) => ({ type: 'principal', value: v }),
  fetchCallReadOnlyFunction: vi.fn(),
  cvToJSON: vi.fn(),
  PostConditionMode: { Deny: 0x02 },
  Pc: {
    principal: () => ({
      willSendEq: () => ({ ustx: () => 'post-condition' }),
      willSendGte: () => ({ ustx: () => 'post-condition' }),
    }),
  },
}));

vi.mock('../services/walletService', () => ({
  walletService: {
    getAddress: () => 'SP2ABC123',
    getUserSession: () => ({}),
  },
}));

vi.mock('../utils/constants', () => ({
  CONTRACT_ADDRESS: 'SP000000000000000000002Q6VF78',
  CONTRACT_NAME: 'ahhbit-tracker',
  NETWORK: 'mainnet',
}));

// Import after mocks are set up
import { contractService } from '../services/contractService';
import { walletService } from '../services/walletService';

describe('contractService', () => {
  beforeEach(() => {
    capturedOptions = null;
  });

  describe('createHabit', () => {
    it('resolves with the transaction ID on approval', async () => {
      const promise = contractService.createHabit('Running', 500_000);
      expect(capturedOptions).not.toBeNull();
      capturedOptions.onFinish({ txId: 'tx-create' });
      await expect(promise).resolves.toBe('tx-create');
    });

    it('rejects when the user cancels', async () => {
      const promise = contractService.createHabit('Running', 500_000);
      capturedOptions.onCancel();
      await expect(promise).rejects.toThrow('Transaction cancelled');
    });
  });

  describe('checkIn', () => {
    it('resolves when the user approves the transaction', async () => {
      const promise = contractService.checkIn(1);
      expect(capturedOptions).not.toBeNull();
      capturedOptions.onFinish({ txId: 'tx-abc' });
      await expect(promise).resolves.toBeUndefined();
    });

    it('rejects when the user cancels the transaction', async () => {
      const promise = contractService.checkIn(1);
      capturedOptions.onCancel();
      await expect(promise).rejects.toThrow('Transaction cancelled');
    });
  });

  describe('withdrawStake', () => {
    it('resolves when the user approves the transaction', async () => {
      const promise = contractService.withdrawStake(1, 1_000_000);
      expect(capturedOptions).not.toBeNull();
      capturedOptions.onFinish({ txId: 'tx-def' });
      await expect(promise).resolves.toBeUndefined();
    });

    it('rejects when the user cancels the transaction', async () => {
      const promise = contractService.withdrawStake(1, 1_000_000);
      capturedOptions.onCancel();
      await expect(promise).rejects.toThrow('Transaction cancelled');
    });
  });

  describe('claimBonus', () => {
    it('resolves when the user approves the transaction', async () => {
      const promise = contractService.claimBonus(1);
      expect(capturedOptions).not.toBeNull();
      capturedOptions.onFinish({ txId: 'tx-ghi' });
      await expect(promise).resolves.toBeUndefined();
    });

    it('rejects when the user cancels the transaction', async () => {
      const promise = contractService.claimBonus(1);
      capturedOptions.onCancel();
      await expect(promise).rejects.toThrow('Transaction cancelled');
    });
  });

  describe('wallet guard', () => {
    it('withdrawStake throws when wallet is not connected', async () => {
      vi.spyOn(walletService, 'getAddress').mockReturnValueOnce(null as any);
      await expect(contractService.withdrawStake(1, 1_000_000)).rejects.toThrow('Wallet not connected');
    });

    it('claimBonus throws when wallet is not connected', async () => {
      vi.spyOn(walletService, 'getAddress').mockReturnValueOnce(null as any);
      await expect(contractService.claimBonus(1)).rejects.toThrow('Wallet not connected');
    });
  });
});
