'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { apiFetch } from '@/lib/api/client';
import { showApiError } from '@/lib/api/show-api-error';
import type { PartyWithPledges } from '@/types/domain';
import type { ApiResult, ApiError } from '@/types/api';

export function usePartyPledges(sgId: string | null, sgTypecode: string | null) {
  const enabled = !!sgId && !!sgTypecode;

  const query = useQuery<ApiResult<PartyWithPledges[]>>({
    queryKey: ['pledges', 'party', sgId, sgTypecode],
    queryFn: () => {
      const params = new URLSearchParams({ sgId: sgId!, sgTypecode: sgTypecode! });
      return apiFetch<PartyWithPledges[]>(`/api/pledges/party?${params}`);
    },
    enabled,
    staleTime: 10 * 60 * 1000,        // 10분 — api_contract §2.5
    gcTime: 60 * 60 * 1000,           // 1h
  });

  const apiError = query.data?.ok === false ? query.data.error : null;

  useEffect(() => {
    if (apiError) showApiError(apiError, query.refetch);
  }, [apiError, query.refetch]);

  const partyGroups = query.data?.ok === true ? query.data.data : [];

  return {
    partyGroups,
    isLoading: query.isLoading,
    isError: query.isError || !!apiError,
    apiError: apiError as ApiError | null,
    refetch: query.refetch,
  };
}
