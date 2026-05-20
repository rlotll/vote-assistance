'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { showApiError } from '@/lib/api/show-api-error';
import { calculateDday } from '@/lib/elections/d-day';
import type { Election } from '@/types/domain';
import type { ApiResult, ApiError } from '@/types/api';

// 오늘 이후 선거 중 가장 가까운 1건 추출 (보완 3: electionDay >= today만 활성)
function pickActiveElection(elections: Election[]): Election | null {
  const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date());
  const upcoming = elections.filter((e) => e.electionDay >= todayStr);
  if (upcoming.length === 0) return null;
  return upcoming.sort((a, b) => a.electionDay.localeCompare(b.electionDay))[0];
}

export function useElection() {
  const query = useQuery<ApiResult<Election[]>>({
    queryKey: ['elections'],
    queryFn: () => apiFetch<Election[]>('/api/elections'),
    staleTime: 60 * 60 * 1000, // 1시간 — api_contract §2.5
  });

  const data = query.data;

  // ApiResult 디스크리미네이트 — ok:false는 data에 담겨 옴 (throw 안 함)
  const election = data?.ok ? pickActiveElection(data.data) : null;
  const apiError: ApiError | null = data?.ok === false ? data.error : null;

  useEffect(() => {
    if (!apiError) return;
    showApiError(apiError, query.refetch);
  }, [apiError, query.refetch]);

  return {
    election,
    isLoading: query.isLoading,
    isError: !!apiError || query.isError,
    apiError,
    refetch: query.refetch,
    // ui-dev(T-10)용: 사전투표 중인지 여부
    dday: election ? calculateDday(election.electionDay) : null,
  };
}
