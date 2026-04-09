export type MobileTxType =
  | 'create-habit'
  | 'check-in'
  | 'withdraw-stake'
  | 'claim-bonus';

export interface ContractCallPreview {
  contractAddress: string;
  contractName: string;
  functionName: MobileTxType;
  functionArgsHex: string[];
  postConditionMode: string;
  postConditions: string[];
}
