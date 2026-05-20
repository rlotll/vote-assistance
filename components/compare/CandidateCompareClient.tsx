'use client';

import { useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useUserStore } from '@/stores/userStore';
import { useElection } from '@/hooks/useElection';
import { useCandidates } from '@/hooks/useCandidates';
import { apiFetch } from '@/lib/api/client';
import { categoryLabel } from '@/lib/pledge-category';
import { sgTypeMeta, isCandidateType } from '@/lib/elections/sg-type';
import { Skeleton } from '@/components/ui/Skeleton';
import { CategoryFilter } from './CategoryFilter';
import { CandidateCard } from './CandidateCard';
import type { Pledge } from '@/types/domain';

export function CandidateCompareClient() {
  const district = useUserStore((s) => s.district);
  const selectedCategories = useUserStore((s) => s.selectedCategories);
  const { election, electionTypes, isLoading: electionLoading } = useElection();

  const sgId = election?.id ?? null;

  // 같은 선거일의 지역구(인물) 선거 종류만 — 비례·통합코드 제외, 코드순 정렬
  const candidateTypes = electionTypes
    .filter((e) => isCandidateType(e.sgTypecode))
    .sort((a, b) => Number(a.sgTypecode) - Number(b.sgTypecode));

  // 사용자가 고른 종류. 목록에 없으면 첫 번째로 자동 보정 (별도 effect 없이 파생)
  const [picked, setPicked] = useState<string | null>(null);
  const sgTypecode = candidateTypes.some((e) => e.sgTypecode === picked)
    ? picked
    : (candidateTypes[0]?.sgTypecode ?? null);

  // 시도지사·교육감 등 시도 단위 선거는 sggName 없이 조회 (실측 §api_contract)
  const scope = sgTypecode ? sgTypeMeta(sgTypecode).scope : null;
  const sidoName = district?.sido.name ?? null;
  const sggName = scope === 'sigungu' ? (district?.sigungu.name ?? null) : null;

  const { candidates, isLoading: candidatesLoading, isError } = useCandidates(
    sgId,
    sgTypecode,
    sidoName,
    sggName,
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

  const categoryText =
    selectedCategories.length > 0
      ? selectedCategories.map(categoryLabel).join(' · ')
      : '전체 공약';
  const typeLabel = sgTypecode ? sgTypeMeta(sgTypecode).label : '';
  // 시도 단위 선거(시도지사·교육감)는 선거구명 대신 시도명만 표시
  const locationText = district
    ? scope === 'sigungu'
      ? `${district.sido.name} ${district.sigungu.name}`
      : district.sido.name
    : '';

  return (
    <div className="flex flex-col gap-4">
      {candidateTypes.length > 1 && (
        <div role="group" aria-label="선거 종류 선택" className="flex flex-wrap gap-2">
          {candidateTypes.map((e) => {
            const isSelected = e.sgTypecode === sgTypecode;
            return (
              <button
                key={e.sgTypecode}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setPicked(e.sgTypecode)}
                className={[
                  'inline-flex items-center min-h-touch-min px-3 rounded-pill text-[0.875rem] font-medium transition-colors',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]',
                  isSelected
                    ? 'bg-brand-strong text-white'
                    : 'bg-background-secondary text-text-secondary hover:text-brand',
                ].join(' ')}
              >
                {sgTypeMeta(e.sgTypecode).label}
              </button>
            );
          })}
        </div>
      )}

      <CategoryFilter />

      <p className="text-[0.8125rem] text-text-secondary">
        {locationText ? `${locationText} · ` : ''}
        {typeLabel ? `${typeLabel} · ` : ''}
        {categoryText}
      </p>

      {isError ? (
        <p role="alert" className="text-[length:var(--font-size-body)] text-text-secondary text-center py-8">
          후보자 정보를 불러오는 중 오류가 발생했어요
        </p>
      ) : candidates.length === 0 ? (
        <p className="text-[length:var(--font-size-body)] text-text-secondary text-center py-8">
          {typeLabel ? `${typeLabel} 선거의 ` : ''}내 선거구 후보자 정보를 찾을 수 없어요
        </p>
      ) : (
        <>
          <ul role="list" tabIndex={0} aria-label="후보자 목록 (좌우 스크롤)" className="flex gap-3 overflow-x-auto pb-2 list-none p-0 m-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]">
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
        </>
      )}
    </div>
  );
}
