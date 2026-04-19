export const queryKeys = {
  habits: (address: string | null | undefined) => ['habits', address] as const,
  userStats: (address: string | null | undefined) => ['userStats', address] as const,
  poolBalance: ['poolBalance'] as const,
  currentBlock: ['currentBlock'] as const,
};
