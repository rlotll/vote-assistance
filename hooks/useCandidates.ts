'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { apiFetch } from '@/lib/api/client';
import { showApiError } from '@/lib/api/show-api-error';
import type { District, Candidate } from '@/types/domain';
import type { ApiResult, ApiError } from '@/types/api';

export function useCandidates(
  sgId: string | null,
  sgTypecode: string | null,
  district: District | null,
) {
  const sggCityCode = district?.sigungu.districtCode ?? null;
  const enabled = !!sgId && !!sgTypecode;

  const query = useQuery<ApiResult<Candidate[]>>({
    queryKey: ['candidates', sgId, sgTypecode, sggCityCode],
    queryFn: () => {
      const params = new URLSearchParams({ sgId: sgId!, sgTypecode: sgTypecode! });
      if (sggCityCode) params.set('sggCityCode', sggCityCode);
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
