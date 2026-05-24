'use client';

import { useEffect, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useUserStore } from '@/stores/userStore';
import { useElection } from '@/hooks/useElection';
import { apiFetch } from '@/lib/api/client';
import { showApiError } from '@/lib/api/show-api-error';
import { categoryLabel } from '@/lib/pledge-category';
import { sgTypeMeta, isCandidateType, hasPledgeData } from '@/lib/elections/sg-type';
import { Info } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { CategoryFilter } from './CategoryFilter';
import { CandidateCard } from './CandidateCard';
import type { Candidate, Pledge } from '@/types/domain';

export function CandidateCompareClient() {
  const district = useUserStore((s) => s.district);
  const selectedCategories = useUserStore((s) => s.selectedCategories);
  const { election, electionTypes, isLoading: electionLoading } = useElection();

  const sgId = election?.id ?? null;
  const sidoName = district?.sido.name ?? null;
  const sggName = district?.sigungu.name ?? null;

  // 같은 선거일의 지역구(인물) 선거 종류만 — 비례·통합코드 제외, 코드순 정렬
  const candidateTypes = electionTypes
    .filter((e) => isCandidateType(e.sgTypecode))
    .sort((a, b) => Number(a.sgTypecode) - Number(b.sgTypecode));

  // 종류별 후보 목록을 병렬 조회 — 후보 0명인 종류(예: 재보궐 국회의원)는 버튼에서 숨긴다.
  // 시도지사·교육감 등 시도 단위 선거는 sggName 없이 조회 (실측 §api_contract)
  const typeQueries = useQueries({
    queries: candidateTypes.map((t) => {
      const sgg = sgTypeMeta(t.sgTypecode).scope === 'sigungu' ? sggName : null;
      return {
        queryKey: ['candidates', sgId, t.sgTypecode, sidoName, sgg],
        queryFn: () => {
          const params = new URLSearchParams({ sgId: sgId!, sgTypecode: t.sgTypecode });
          if (sidoName) params.set('sidoName', sidoName);
          if (sgg) params.set('sggName', sgg);
          return apiFetch<Candidate[]>(`/api/candidates?${params}`);
        },
        enabled: !!sgId,
        staleTime: 10 * 60 * 1000,
        gcTime: 60 * 60 * 1000,
      };
    }),
  });

  const typesSettling = typeQueries.some((q) => q.isLoading);

  // 후보가 1명 이상 조회된 종류만 노출
  const availableTypes = candidateTypes.filter((_, i) => {
    const d = typeQueries[i]?.data;
    return d?.ok === true && d.data.length > 0;
  });

  // 사용자가 고른 종류. 노출 목록에 없으면 첫 번째로 자동 보정 (별도 effect 없이 파생)
  const [picked, setPicked] = useState<string | null>(null);
  const sgTypecode = availableTypes.some((e) => e.sgTypecode === picked)
    ? picked
    : (availableTypes[0]?.sgTypecode ?? null);

  const scope = sgTypecode ? sgTypeMeta(sgTypecode).scope : null;
  // NEC가 공약서를 제공하지 않는 종류(시도의원·구시군의원 등)는 공약 조회를 건너뛴다
  const pledgeProvided = sgTypecode ? hasPledgeData(sgTypecode) : true;

  // 선택된 종류의 후보 목록·상태는 typeQueries에서 재사용 (추가 요청 없음)
  const selectedQuery = typeQueries[candidateTypes.findIndex((e) => e.sgTypecode === sgTypecode)];
  const candidates = selectedQuery?.data?.ok === true ? selectedQuery.data.data : [];

  // API 오류 토스트·재시도 (NF-02). 노출할 종류가 없을 때도 오류면 오류 상태로 처리
  const erroredQuery = typeQueries.find((q) => q.data?.ok === false);
  const errorData = erroredQuery?.data?.ok === false ? erroredQuery.data.error : null;
  useEffect(() => {
    if (errorData) showApiError(errorData, () => typeQueries.forEach((q) => q.refetch()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [errorData]);
  const isError = selectedQuery
    ? selectedQuery.data?.ok === false || selectedQuery.isError
    : availableTypes.length === 0 && !!errorData;

  // 후보별 공약 병렬 조회 (hook 규칙상 useQueries로 동적 구성)
  const pledgeQueries = useQueries({
    queries: candidates.map((c) => ({
      queryKey: ['pledges', 'candidate', sgId, sgTypecode, c.id],
      queryFn: () => {
        const params = new URLSearchParams({ sgId: sgId!, sgTypecode: sgTypecode!, huboid: c.id });
        return apiFetch<Pledge[]>(`/api/pledges/candidate?${params}`);
      },
      enabled: !!sgId && !!sgTypecode && pledgeProvided,
      staleTime: 10 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
    })),
  });

  const loading = electionLoading || typesSettling;

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
      {availableTypes.length > 1 && (
        <div role="group" aria-label="선거 종류 선택" className="flex flex-wrap gap-2">
          {availableTypes.map((e) => {
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
          {!pledgeProvided && (
            <Card variant="info">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-brand-strong shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-[length:var(--font-size-body)] text-text-primary">
                  {typeLabel} 선거는 선거관리위원회에서 공약서를 제공하지 않아, 후보자 목록만 표시돼요.
                </p>
              </div>
            </Card>
          )}

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
