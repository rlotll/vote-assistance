'use client';

import { useEffect, useState } from 'react';
import { geocodeStations } from '@/lib/polling-stations/geocode';
import type { PollingStation } from '@/types/domain';

// 투표소 목록에 좌표를 보강해 반환. geocode 완료 전에는 원본(좌표 0)을 그대로 노출.
export function useGeocodedStations(stations: PollingStation[]): PollingStation[] {
  const [geocoded, setGeocoded] = useState<PollingStation[]>(stations);

  useEffect(() => {
    if (stations.length === 0) return; // 빈 목록은 아래 반환에서 그대로 노출
    let cancelled = false;
    geocodeStations(stations)
      .then((result) => {
        if (!cancelled) setGeocoded(result);
      })
      .catch(() => {
        if (!cancelled) setGeocoded(stations); // SDK 실패 시 원본 유지
      });
    return () => {
      cancelled = true;
    };
  }, [stations]);

  // 목록이 비면 항상 빈 배열, 아니면 geocode 결과(완료 전엔 직전 상태)
  return stations.length === 0 ? stations : geocoded;
}
