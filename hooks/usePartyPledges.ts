'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { apiFetch } from '@/lib/api/client';
import { showApiError } from '@/lib/api/show-api-error';
import type { District, PartyWithPledges } from '@/types/domain';
import type { ApiResult, ApiError } from '@/types/api';

export function usePartyPledges(
  sgId: string | null,
  sgTypecode: string | null,
  district: District | null,
) {
  const sidoName = district?.sido.name ?? null;
  const sggName = district?.sigungu.name ?? null;
  const enabled = !!sgId && !!sgTypecode;

  const query = useQuery<ApiResult<PartyWithPledges[]>>({
    queryKey: ['pledges', 'party', sgId, sgTypecode, sidoName, sggName],
    queryFn: () => {
      const params = new URLSearchParams({ sgId: sgId!, sgTypecode: sgTypecode! });
      if (sidoName) params.set('sidoName', sidoName);
      if (sggName) params.set('sggName', sggName);
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
