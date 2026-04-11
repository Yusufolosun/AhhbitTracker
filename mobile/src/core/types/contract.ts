export interface ContractId {
  contractAddress: string;
  contractName: string;
}

export type StacksNetworkMode = 'mainnet' | 'testnet';
export type AppStage = 'development' | 'staging' | 'production';

export interface AppNetworkConfig {
  contract: ContractId;
  hiroApiBaseUrl: string;
  networkMode: StacksNetworkMode;
  appStage: AppStage;
}
