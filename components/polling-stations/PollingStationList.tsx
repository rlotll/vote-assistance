'use client';

import { Skeleton } from '@/components/ui/Skeleton';
import { PollingStationCard } from './PollingStationCard';
import type { PollingStation } from '@/types/domain';

type Props = {
  pollingStations: PollingStation[];
  isLoading: boolean;
  isError: boolean;
  noElection: boolean;
};

export function PollingStationList({ pollingStations, isLoading, isError, noElection }: Props) {
  if (isLoading) {
    return (
      <div aria-busy="true" className="flex flex-col gap-3">
        <Skeleton preset="list-item" count={4} />
      </div>
    );
  }

  if (noElection) {
    return (
      <p className="text-[length:var(--font-size-body)] text-text-secondary text-center py-8">
        선거 정보를 불러올 수 없어요
      </p>
    );
  }

  if (isError) {
    return (
      <p role="alert" className="text-[length:var(--font-size-body)] text-text-secondary text-center py-8">
        투표소 정보를 불러오는 중 오류가 발생했어요
      </p>
    );
  }

  if (pollingStations.length === 0) {
    return (
      <p className="text-[length:var(--font-size-body)] text-text-secondary text-center py-8">
        주변 투표소를 찾을 수 없어요
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3 list-none p-0 m-0">
      {pollingStations.map((station) => (
        <PollingStationCard key={station.id} station={station} />
      ))}
    </ul>
  );
}
