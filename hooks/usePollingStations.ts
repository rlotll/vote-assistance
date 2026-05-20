'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { apiFetch } from '@/lib/api/client';
import { showApiError } from '@/lib/api/show-api-error';
import type { District, PollingStation } from '@/types/domain';
import type { ApiResult, ApiError } from '@/types/api';

export function usePollingStations(
  sgId: string | null,
  sgTypecode: string | null,
  district: District | null,
) {
  const enabled = !!sgId && !!sgTypecode && !!district;

  const query = useQuery<ApiResult<PollingStation[]>>({
    queryKey: ['polling-stations', sgId, sgTypecode, district?.sido.name, district?.sigungu.name],
    queryFn: () => {
      const params = new URLSearchParams({
        sgId: sgId!,
        sgTypecode: sgTypecode!,
        sidoName: district!.sido.name,
        sggName: district!.sigungu.name,
      });
      return apiFetch<PollingStation[]>(`/api/polling-stations?${params}`);
    },
    enabled,
    staleTime: 30 * 60 * 1000,        // 30분
    gcTime: 24 * 60 * 60 * 1000,      // 24h
  });

  const apiError = query.data?.ok === false ? query.data.error : null;

  useEffect(() => {
    if (apiError) showApiError(apiError, query.refetch);
  }, [apiError, query.refetch]);

  const pollingStations = query.data?.ok === true ? query.data.data : [];

  return {
    pollingStations,
    isLoading: query.isLoading,
    isError: query.isError || !!apiError,
    apiError: apiError as ApiError | null,
    refetch: query.refetch,
  };
}
