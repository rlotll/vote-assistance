'use client';

import { useElection } from '@/hooks/useElection';
import { DdayBanner } from './DdayBanner';
import { NoElectionNotice } from './NoElectionNotice';
import { DistrictSummary } from './DistrictSummary';
import { QuickMenu } from './QuickMenu';
import { Skeleton } from '@/components/ui/Skeleton';

export function HomeClient() {
  const { election, isLoading, apiError, dday } = useElection();

  if (isLoading) {
    return (
      <div className="px-4 py-4 flex flex-col gap-4">
        <div aria-busy="true">
          <Skeleton preset="list-item" className="h-32" />
        </div>
        <DistrictSummary />
        <QuickMenu />
      </div>
    );
  }

  return (
    <div className="px-4 py-4 flex flex-col gap-4">
      {election && dday !== null ? (
        <DdayBanner election={election} dday={dday} />
      ) : !apiError ? (
        <NoElectionNotice />
      ) : null}
      <DistrictSummary />
      <QuickMenu />
    </div>
  );
}
