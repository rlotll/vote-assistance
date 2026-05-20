'use client';

import { useState } from 'react';
import { useUserStore } from '@/stores/userStore';
import { useElection } from '@/hooks/useElection';
import { usePollingStations } from '@/hooks/usePollingStations';
import { Tabs } from '@/components/ui/Tabs';
import { DistrictBadgeRow } from './DistrictBadgeRow';
import { PollingMap } from './PollingMap';
import { PollingStationList } from './PollingStationList';

const TAB_ITEMS = [
  { value: 'map', label: '지도' },
  { value: 'list', label: '목록' },
];

export function PollingStationsClient() {
  const [activeTab, setActiveTab] = useState<'map' | 'list'>('map');

  const district = useUserStore((s) => s.district);
  const { election } = useElection();

  const { pollingStations, isLoading, isError } = usePollingStations(
    election?.id ?? null,
    election?.sgTypecode ?? null,
    district,
  );

  const noElection = !election;

  return (
    <div className="flex flex-col gap-4">
      <DistrictBadgeRow />

      <Tabs
        value={activeTab}
        onChange={(v) => setActiveTab(v as 'map' | 'list')}
        items={TAB_ITEMS}
        ariaLabel="투표소 보기 방식 선택"
      />

      {activeTab === 'map' ? (
        <PollingMap
          pollingStations={pollingStations}
          isLoading={isLoading}
          isError={isError}
          noElection={noElection}
        />
      ) : (
        <PollingStationList
          pollingStations={pollingStations}
          isLoading={isLoading}
          isError={isError}
          noElection={noElection}
        />
      )}
    </div>
  );
}
