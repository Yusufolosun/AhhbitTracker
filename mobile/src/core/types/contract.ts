export interface ContractId {
  contractAddress: string;
  contractName: string;
}

export type StacksNetworkMode = 'mainnet' | 'testnet';

export interface AppNetworkConfig {
  contract: ContractId;
  hiroApiBaseUrl: string;
  networkMode: StacksNetworkMode;
}
