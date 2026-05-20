'use client';

import { useState } from 'react';
import { useUserStore } from '@/stores/userStore';
import { useElection } from '@/hooks/useElection';
import { usePollingStations } from '@/hooks/usePollingStations';
import { useGeocodedStations } from '@/hooks/useGeocodedStations';
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
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const district = useUserStore((s) => s.district);
  const { election } = useElection();

  const { pollingStations, isLoading, isError } = usePollingStations(election?.id ?? null, district);
  // 좌표 보강(주소 → 좌표)을 지도·목록이 공유
  const stations = useGeocodedStations(pollingStations);

  const noElection = !election;

  // 목록에서 투표소 선택 시 지도 탭으로 전환하며 해당 핀으로 이동
  function handleSelect(id: string) {
    setSelectedId(id);
    setActiveTab('map');
  }

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
          pollingStations={stations}
          selectedId={selectedId}
          isLoading={isLoading}
          isError={isError}
          noElection={noElection}
        />
      ) : (
        <PollingStationList
          pollingStations={stations}
          onSelect={handleSelect}
          isLoading={isLoading}
          isError={isError}
          noElection={noElection}
        />
      )}
    </div>
  );
}
