'use client';

import { useQueries } from '@tanstack/react-query';
import { useUserStore } from '@/stores/userStore';
import { useElection } from '@/hooks/useElection';
import { useCandidates } from '@/hooks/useCandidates';
import { apiFetch } from '@/lib/api/client';
import { categoryLabel } from '@/lib/pledge-category';
import { Skeleton } from '@/components/ui/Skeleton';
import { CategoryFilter } from './CategoryFilter';
import { CandidateCard } from './CandidateCard';
import type { Pledge } from '@/types/domain';

export function CandidateCompareClient() {
  const district = useUserStore((s) => s.district);
  const selectedCategories = useUserStore((s) => s.selectedCategories);
  const { election, isLoading: electionLoading } = useElection();

  const sgId = election?.id ?? null;
  const sgTypecode = election?.sgTypecode ?? null;

  const { candidates, isLoading: candidatesLoading, isError } = useCandidates(
    sgId,
    sgTypecode,
    district,
  );

  // 후보별 공약 병렬 조회 (hook 규칙상 useQueries로 동적 구성)
  const pledgeQueries = useQueries({
    queries: candidates.map((c) => ({
      queryKey: ['pledges', 'candidate', sgId, sgTypecode, c.id],
      queryFn: () => {
        const params = new URLSearchParams({ sgId: sgId!, sgTypecode: sgTypecode!, huboid: c.id });
        return apiFetch<Pledge[]>(`/api/pledges/candidate?${params}`);
      },
      enabled: !!sgId && !!sgTypecode,
      staleTime: 10 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
    })),
  });

  const loading = electionLoading || candidatesLoading;

  if (loading) {
    return (
      <div aria-busy="true" className="flex flex-col gap-3">
        <Skeleton preset="list-item" count={3} />
      </div>
    );
  }

  if (!election) {
    return (
      <p className="text-[length:var(--font-size-body)] text-text-secondary text-center py-8">
        선거 정보를 불러올 수 없어요
      </p>
    );
  }

  if (isError) {
    return (
      <p role="alert" className="text-[length:var(--font-size-body)] text-text-secondary text-center py-8">
        후보자 정보를 불러오는 중 오류가 발생했어요
      </p>
    );
  }

  if (candidates.length === 0) {
    return (
      <p className="text-[length:var(--font-size-body)] text-text-secondary text-center py-8">
        내 선거구의 후보자 정보를 찾을 수 없어요
      </p>
    );
  }

  const categoryText =
    selectedCategories.length > 0
      ? selectedCategories.map(categoryLabel).join(' · ')
      : '전체 공약';

  return (
    <div className="flex flex-col gap-4">
      <CategoryFilter />

      <p className="text-[0.8125rem] text-text-secondary">
        {district ? `${district.sido.name} ${district.sigungu.name} · ` : ''}
        {categoryText}
      </p>

      <ul className="flex gap-3 overflow-x-auto pb-2 list-none p-0 m-0">
        {candidates.map((candidate, index) => {
          const q = pledgeQueries[index];
          const pledges = q?.data?.ok === true ? q.data.data : [];
          return (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              pledges={pledges}
              isLoading={q?.isLoading ?? false}
              selectedCategories={selectedCategories}
            />
          );
        })}
      </ul>

      {candidates.length > 1 && (
        <p className="text-[0.75rem] text-text-secondary text-center">좌우로 스크롤하여 더 보기</p>
      )}
    </div>
  );
}
