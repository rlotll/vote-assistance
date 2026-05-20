'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 각 useQuery에서 staleTime override — api_contract §2.5
        staleTime: 60_000,
        retry: 2,
        retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
        refetchOnWindowFocus: false,
      },
    },
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  // SSR에서 QueryClient를 싱글턴으로 공유하지 않도록 useState로 생성
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
