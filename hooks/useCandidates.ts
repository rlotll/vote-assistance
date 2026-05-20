'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { apiFetch } from '@/lib/api/client';
import { showApiError } from '@/lib/api/show-api-error';
import type { Candidate } from '@/types/domain';
import type { ApiResult, ApiError } from '@/types/api';

// sggName=null이면 시도 단위 조회(시도지사·교육감 등). scope 결정은 호출측이 sgTypecode로 판단.
export function useCandidates(
  sgId: string | null,
  sgTypecode: string | null,
  sidoName: string | null,
  sggName: string | null,
) {
  const enabled = !!sgId && !!sgTypecode;

  const query = useQuery<ApiResult<Candidate[]>>({
    queryKey: ['candidates', sgId, sgTypecode, sidoName, sggName],
    queryFn: () => {
      const params = new URLSearchParams({ sgId: sgId!, sgTypecode: sgTypecode! });
      if (sidoName) params.set('sidoName', sidoName);
      if (sggName) params.set('sggName', sggName);
      return apiFetch<Candidate[]>(`/api/candidates?${params}`);
    },
    enabled,
    staleTime: 10 * 60 * 1000,        // 10분 — api_contract §2.5 (선거기간 갱신)
    gcTime: 60 * 60 * 1000,           // 1h
  });

  const apiError = query.data?.ok === false ? query.data.error : null;

  useEffect(() => {
    if (apiError) showApiError(apiError, query.refetch);
  }, [apiError, query.refetch]);

  const candidates = query.data?.ok === true ? query.data.data : [];

  return {
    candidates,
    isLoading: query.isLoading,
    isError: query.isError || !!apiError,
    apiError: apiError as ApiError | null,
    refetch: query.refetch,
  };
}
