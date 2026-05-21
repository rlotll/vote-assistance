'use client';

import { useElection } from '@/hooks/useElection';
import { DdayBanner } from './DdayBanner';
import { DdayBannerLoading } from './DdayBannerLoading';
import { DdayBannerError } from './DdayBannerError';
import { NoElectionNotice } from './NoElectionNotice';
import { DistrictSummary } from './DistrictSummary';
import { QuickMenu } from './QuickMenu';

export function HomeClient() {
  const { election, isLoading, apiError, dday, refetch } = useElection();

  return (
    <div className="px-4 py-4 flex flex-col gap-4">
      {isLoading ? (
        <DdayBannerLoading />
      ) : election && dday !== null ? (
        <DdayBanner election={election} dday={dday} />
      ) : apiError ? (
        <DdayBannerError onRetry={() => refetch()} />
      ) : (
        <NoElectionNotice />
      )}
      <DistrictSummary />
      <QuickMenu />
    </div>
  );
}
