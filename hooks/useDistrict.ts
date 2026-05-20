'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { apiFetch } from '@/lib/api/client';
import { showApiError } from '@/lib/api/show-api-error';
import { SIDOS } from '@/lib/constants/sido';
import type { Sido, Sigungu } from '@/types/domain';
import type { ApiResult, ApiError } from '@/types/api';

// 시/도는 상수 — API 호출 불필요, TanStack Query 없이 동기 반환
export function useSido() {
  return { sidos: SIDOS, isLoading: false, isError: false, apiError: null as ApiError | null };
}

// 시/군/구는 선거 + 시도명(한국어) 조합으로 동적 조회 (NEC getCommonGusigunCodeList)
export function useSigungu(sgId: string | null, sidoName: string | null) {
  const enabled = !!sgId && !!sidoName;

  const query = useQuery<ApiResult<Sigungu[]>>({
    queryKey: ['districts', 'sigungu', sgId, sidoName],
    queryFn: () => {
      const params = new URLSearchParams({ sgId: sgId!, sdName: sidoName! });
      return apiFetch<Sigungu[]>(`/api/districts/sigungu?${params}`);
    },
    enabled,
    staleTime: 24 * 60 * 60 * 1000,  // 24h
    gcTime: 7 * 24 * 60 * 60 * 1000, // 7d
  });

  const apiError = query.data?.ok === false ? query.data.error : null;

  useEffect(() => {
    if (apiError) showApiError(apiError, query.refetch);
  }, [apiError, query.refetch]);

  const sigungus = query.data?.ok === true ? query.data.data : [];

  return {
    sigungus,
    isLoading: query.isLoading,
    isError: query.isError || !!apiError,
    apiError,
    refetch: query.refetch,
  };
}
