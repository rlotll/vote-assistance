'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { apiFetch } from '@/lib/api/client';
import { showApiError } from '@/lib/api/show-api-error';
import type { Pledge } from '@/types/domain';
import type { ApiResult, ApiError } from '@/types/api';

export function useCandidatePledges(
  sgId: string | null,
  sgTypecode: string | null,
  huboid: string | null,
) {
  const enabled = !!sgId && !!sgTypecode && !!huboid;

  const query = useQuery<ApiResult<Pledge[]>>({
    queryKey: ['pledges', 'candidate', sgId, sgTypecode, huboid],
    queryFn: () => {
      const params = new URLSearchParams({ sgId: sgId!, sgTypecode: sgTypecode!, huboid: huboid! });
      return apiFetch<Pledge[]>(`/api/pledges/candidate?${params}`);
    },
    enabled,
    staleTime: 10 * 60 * 1000,        // 10분 — api_contract §2.5
    gcTime: 60 * 60 * 1000,           // 1h
  });

  const apiError = query.data?.ok === false ? query.data.error : null;

  useEffect(() => {
    if (apiError) showApiError(apiError, query.refetch);
  }, [apiError, query.refetch]);

  const pledges = query.data?.ok === true ? query.data.data : [];

  return {
    pledges,
    isLoading: query.isLoading,
    isError: query.isError || !!apiError,
    apiError: apiError as ApiError | null,
    refetch: query.refetch,
  };
}
