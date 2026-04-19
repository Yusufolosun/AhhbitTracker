import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import type { PropsWithChildren } from 'react';

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (failureCount, error: unknown) => {
          if (failureCount >= 2) {
            return false;
          }

          if (typeof error === 'object' && error !== null && 'status' in error) {
            const status = (error as { status?: number }).status;
            if (status === 404) {
              return false;
            }
          }

          return true;
        },
        staleTime: 30_000,
        gcTime: 15 * 60_000,
        refetchOnMount: false,
        refetchOnReconnect: true,
        refetchOnWindowFocus: false,
      },
    },
  });
}

export function QueryProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(createQueryClient);
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
