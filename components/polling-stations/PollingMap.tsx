'use client';

import { useEffect, useRef, useState } from 'react';
import { loadKakaoSdk } from '@/lib/kakao/sdk';
import type { PollingStation } from '@/types/domain';

/* eslint-disable @typescript-eslint/no-explicit-any */
type Props = {
  pollingStations: PollingStation[];
  selectedId: string | null;
  isLoading: boolean;
  isError: boolean;
  noElection: boolean;
};

function hasCoord(s: PollingStation): boolean {
  return s.lat !== 0 || s.lng !== 0;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c);
}

// 마커 클릭/선택 시 표시할 InfoWindow 내용
function infoContent(s: PollingStation): string {
  const floor = s.floor ? ` ${escapeHtml(s.floor)}` : '';
  return `<div style="padding:8px 10px;font-size:12px;line-height:1.5;max-width:220px;">
    <div style="font-weight:600;margin-bottom:2px;">${escapeHtml(s.name)}</div>
    <div style="color:#555;">${escapeHtml(s.address)}${floor}</div>
    <div style="color:#555;">${escapeHtml(s.hours)}</div>
  </div>`;
}

export function PollingMap({ pollingStations, selectedId, isLoading, isError, noElection }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const infoWindowRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

  // SDK 로드 + 지도 초기화 (1회). 초기화는 비동기이므로 완료를 mapReady로 알려 마커 effect를 재실행시킨다.
  useEffect(() => {
    if (!apiKey || !containerRef.current) return;
    let cancelled = false;
    loadKakaoSdk()
      .then((kakao) => {
        if (cancelled || !containerRef.current || mapRef.current) return;
        const center = new kakao.maps.LatLng(37.5665, 126.978);
        mapRef.current = new kakao.maps.Map(containerRef.current, { center, level: 5 });
        setMapReady(true);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  // 마커 갱신 (좌표가 보강된 투표소만)
  useEffect(() => {
    const kakao = window.kakao;
    if (!mapReady || !mapRef.current || !kakao?.maps) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current.clear();

    const located = pollingStations.filter(hasCoord);
    if (located.length === 0) return;

    if (!infoWindowRef.current) {
      infoWindowRef.current = new kakao.maps.InfoWindow({ removable: true });
    }

    const bounds = new kakao.maps.LatLngBounds();
    located.forEach((s) => {
      const position = new kakao.maps.LatLng(s.lat, s.lng);
      const marker = new kakao.maps.Marker({ map: mapRef.current, position, title: s.name });
      // 마커 클릭 시 투표소 정보 표시
      kakao.maps.event.addListener(marker, 'click', () => {
        infoWindowRef.current.setContent(infoContent(s));
        infoWindowRef.current.open(mapRef.current, marker);
      });
      markersRef.current.set(s.id, marker);
      bounds.extend(position);
    });
    if (!bounds.isEmpty()) mapRef.current.setBounds(bounds);
  }, [pollingStations, mapReady]);

  // 목록에서 선택한 투표소로 지도 중심 이동 + 정보창 표시
  useEffect(() => {
    const kakao = window.kakao;
    if (!mapReady || !mapRef.current || !selectedId || !kakao?.maps) return;
    const target = pollingStations.find((s) => s.id === selectedId);
    if (target && hasCoord(target)) {
      mapRef.current.panTo(new kakao.maps.LatLng(target.lat, target.lng));
      const marker = markersRef.current.get(selectedId);
      if (marker && infoWindowRef.current) {
        infoWindowRef.current.setContent(infoContent(target));
        infoWindowRef.current.open(mapRef.current, marker);
      }
    }
  }, [selectedId, pollingStations, mapReady]);

  // 컨테이너는 항상 DOM에 유지(SDK 로드 후 인스턴스화). 상태 안내는 오버레이로 표시.
  const overlay =
    (!apiKey && '지도 서비스를 사용할 수 없어요') ||
    (isLoading && '지도를 불러오는 중...') ||
    (noElection && '선거 정보를 불러올 수 없어요') ||
    (isError && '투표소 정보를 불러오는 중 오류가 발생했어요') ||
    (pollingStations.length === 0 && '주변 투표소를 찾을 수 없어요') ||
    null;

  return (
    <div className="relative w-full h-[50vh] rounded-card overflow-hidden bg-background-secondary">
      <div ref={containerRef} className="absolute inset-0" aria-label="투표소 위치 지도" role="img" />
      {overlay && (
        <div className="absolute inset-0 flex items-center justify-center bg-background-secondary">
          <p className="text-[length:var(--font-size-body)] text-text-secondary">{overlay}</p>
        </div>
      )}
    </div>
  );
}
