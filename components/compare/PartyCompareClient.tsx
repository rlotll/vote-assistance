'use client';

import { useUserStore } from '@/stores/userStore';
import { useElection } from '@/hooks/useElection';
import { usePartyPledges } from '@/hooks/usePartyPledges';
import { hasProportionalRepresentation } from '@/types/domain';
import { categoryLabel } from '@/lib/pledge-category';
import { sgTypeMeta } from '@/lib/elections/sg-type';
import { Skeleton } from '@/components/ui/Skeleton';
import { CategoryFilter } from './CategoryFilter';
import { PartyCard } from './PartyCard';

export function PartyCompareClient() {
  const selectedCategories = useUserStore((s) => s.selectedCategories);
  const district = useUserStore((s) => s.district);
  const { election, electionTypes, isLoading: electionLoading } = useElection();

  const proportional = !!election && hasProportionalRepresentation(election);
  // 비례 종류(광역/기초 비례 등) 중 첫 번째 기준으로 정당 목록 추출
  const proportionalType = electionTypes
    .filter((e) => sgTypeMeta(e.sgTypecode).isProportional)
    .sort((a, b) => Number(a.sgTypecode) - Number(b.sgTypecode))[0];
  const sgId = proportional ? election!.id : null;
  const sgTypecode = proportional ? (proportionalType?.sgTypecode ?? null) : null;

  const { partyGroups, isLoading: partiesLoading, isError } = usePartyPledges(sgId, sgTypecode, district);

  if (electionLoading) {
    return (
      <div aria-busy="true" className="flex flex-col gap-3">
        <Skeleton preset="list-item" count={3} />
      </div>
    );
  }

  // 비례대표 미제공 선거 — 와이어프레임 S-05 조건부 표시
  if (!proportional) {
    return (
      <p className="text-[length:var(--font-size-body)] text-text-secondary text-center py-8">
        해당 선거에서는 정당 비례대표 정책을 제공하지 않아요
      </p>
    );
  }

  if (partiesLoading) {
    return (
      <div aria-busy="true" className="flex flex-col gap-3">
        <Skeleton preset="list-item" count={3} />
      </div>
    );
  }

  if (isError) {
    return (
      <p role="alert" className="text-[length:var(--font-size-body)] text-text-secondary text-center py-8">
        정당 정책을 불러오는 중 오류가 발생했어요
      </p>
    );
  }

  if (partyGroups.length === 0) {
    return (
      <p className="text-[length:var(--font-size-body)] text-text-secondary text-center py-8">
        비례대표 정당 정책을 찾을 수 없어요
      </p>
    );
  }

  const categoryText =
    selectedCategories.length > 0 ? selectedCategories.map(categoryLabel).join(' · ') : '전체 정책';

  return (
    <div className="flex flex-col gap-4">
      <CategoryFilter />

      <p className="text-[0.8125rem] text-text-secondary">{categoryText}</p>

      <ul role="list" tabIndex={0} aria-label="정당 목록 (좌우 스크롤)" className="flex gap-3 overflow-x-auto pb-2 list-none p-0 m-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]">
        {partyGroups.map(({ party, pledges }) => (
          <PartyCard
            key={party.id}
            party={party}
            pledges={pledges}
            selectedCategories={selectedCategories}
          />
        ))}
      </ul>

      {partyGroups.length > 1 && (
        <p className="text-[0.75rem] text-text-secondary text-center">좌우로 스크롤하여 더 보기</p>
      )}
    </div>
  );
}
