'use client';

import { useUserStore } from '@/stores/userStore';
import { useElection } from '@/hooks/useElection';
import { usePartyPledges } from '@/hooks/usePartyPledges';
import { hasProportionalRepresentation } from '@/types/domain';
import { categoryLabel } from '@/lib/pledge-category';
import { Skeleton } from '@/components/ui/Skeleton';
import { CategoryFilter } from './CategoryFilter';
import { PartyCard } from './PartyCard';

export function PartyCompareClient() {
  const selectedCategories = useUserStore((s) => s.selectedCategories);
  const { election, isLoading: electionLoading } = useElection();

  const proportional = !!election && hasProportionalRepresentation(election);
  const sgId = proportional ? election!.id : null;
  const sgTypecode = proportional ? election!.sgTypecode : null;

  const { partyGroups, isLoading: partiesLoading, isError } = usePartyPledges(sgId, sgTypecode);

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

      <ul className="flex gap-3 overflow-x-auto pb-2 list-none p-0 m-0">
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
