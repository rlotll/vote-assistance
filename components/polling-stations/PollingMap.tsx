'use client';

import { useEffect, useRef } from 'react';
import type { PollingStation } from '@/types/domain';

declare global {
  interface Window {
    kakao: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  }
}

type Props = {
  pollingStations: PollingStation[];
  isLoading: boolean;
  isError: boolean;
  noElection: boolean;
};

function resolveCoords(
  station: PollingStation,
): Promise<{ lat: number; lng: number }> {
  if (station.lat !== 0 && station.lng !== 0) {
    return Promise.resolve({ lat: station.lat, lng: station.lng });
  }
  return new Promise((resolve, reject) => {
    const geocoder = new window.kakao.maps.services.Geocoder();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    geocoder.addressSearch(station.address, (result: any[], status: string) => {
      if (status === window.kakao.maps.services.Status.OK) {
        resolve({ lat: Number(result[0].y), lng: Number(result[0].x) });
      } else {
        reject(new Error(`Geocoder failed for: ${station.address}`));
      }
    });
  });
}


export function PollingMap({ pollingStations, isLoading, isError, noElection }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);
  const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

  // SDK 로드 + 지도 초기화 (1회만 실행)
  useEffect(() => {
    if (!apiKey || !containerRef.current) return;

    function initMap() {
      if (!containerRef.current || mapRef.current) return;
      const center = new window.kakao.maps.LatLng(37.5665, 126.9780);
      mapRef.current = new window.kakao.maps.Map(containerRef.current, { center, level: 5 });
    }

    if (window.kakao?.maps) {
      window.kakao.maps.load(initMap);
      return;
    }

    const existing = document.querySelector('script[data-kakao-map]');
    if (existing) {
      existing.addEventListener('load', () => window.kakao.maps.load(initMap));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`;
    script.setAttribute('data-kakao-map', '');
    script.onload = () => window.kakao.maps.load(initMap);
    document.head.appendChild(script);
  }, [apiKey]);

  // 마커 갱신 (pollingStations 변경 시 기존 마커 제거 후 재추가)
  useEffect(() => {
    if (!mapRef.current) return;

    // 기존 마커 제거
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    if (pollingStations.length === 0) return;

    const bounds = new window.kakao.maps.LatLngBounds();
    const promises = pollingStations.map((station) =>
      resolveCoords(station)
        .then(({ lat, lng }) => {
          const position = new window.kakao.maps.LatLng(lat, lng);
          const marker = new window.kakao.maps.Marker({ map: mapRef.current, position, title: station.name });
          markersRef.current.push(marker);
          bounds.extend(position);
        })
        .catch((err) => {
          console.warn('[PollingMap] 마커 스킵:', err.message);
        }),
    );

    Promise.all(promises).then(() => {
      if (!bounds.isEmpty()) mapRef.current.setBounds(bounds);
    });
  }, [pollingStations]);

  // 컨테이너는 항상 DOM에 유지해야 SDK 로드 후 지도 인스턴스화가 가능 (useEffect의 ref 가드).
  // 상태별 안내는 오버레이로 덮어 표시.
  const overlay =
    (!apiKey && '지도 서비스를 사용할 수 없어요') ||
    (isLoading && '지도를 불러오는 중...') ||
    (noElection && '선거 정보를 불러올 수 없어요') ||
    (isError && '투표소 정보를 불러오는 중 오류가 발생했어요') ||
    (pollingStations.length === 0 && '주변 투표소를 찾을 수 없어요') ||
    null;

  return (
    <div className="relative w-full h-[50vh] rounded-card overflow-hidden bg-background-secondary">
      <div
        ref={containerRef}
        className="absolute inset-0"
        aria-label="투표소 위치 지도"
        role="img"
      />
      {overlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-background-secondary">
          <p className="text-[length:var(--font-size-body)] text-text-secondary">{overlay}</p>
        </div>
      )}
    </div>
  );
}