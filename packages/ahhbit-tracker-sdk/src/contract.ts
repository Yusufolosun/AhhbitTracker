import { MAINNET_CONTRACT } from './constants';
import type { ContractId } from './types';

export function resolveContract(override?: Partial<ContractId>): ContractId {
  return {
    contractAddress: override?.contractAddress ?? MAINNET_CONTRACT.contractAddress,
    contractName: override?.contractName ?? MAINNET_CONTRACT.contractName,
  };
}

export function contractPrincipal(contract: ContractId): string {
  return `${contract.contractAddress}.${contract.contractName}`;
}