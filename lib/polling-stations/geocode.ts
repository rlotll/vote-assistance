// 투표소 주소 → 좌표 보강. NEC 응답에 좌표가 없어 Kakao Geocoder(클라이언트)로 변환.
// 주소별 좌표를 모듈 캐시에 보관해 재조회를 막는다.
'use client';

import { loadKakaoSdk } from '@/lib/kakao/sdk';
import type { PollingStation } from '@/types/domain';

/* eslint-disable @typescript-eslint/no-explicit-any */
const cache = new Map<string, { lat: number; lng: number } | null>();

function geocodeOne(kakao: any, geocoder: any, address: string): Promise<{ lat: number; lng: number } | null> {
  if (cache.has(address)) return Promise.resolve(cache.get(address)!);
  return new Promise((resolve) => {
    geocoder.addressSearch(address, (result: any[], status: string) => {
      const coord =
        status === kakao.maps.services.Status.OK && result[0]
          ? { lat: Number(result[0].y), lng: Number(result[0].x) }
          : null;
      cache.set(address, coord);
      resolve(coord);
    });
  });
}

// 좌표가 비어 있는(0,0) 투표소만 주소로 보강. 실패 항목은 좌표 0 유지.
export async function geocodeStations(stations: PollingStation[]): Promise<PollingStation[]> {
  const kakao = await loadKakaoSdk();
  const geocoder = new kakao.maps.services.Geocoder();
  return Promise.all(
    stations.map(async (s) => {
      if (s.lat !== 0 || s.lng !== 0) return s;
      const coord = await geocodeOne(kakao, geocoder, s.address);
      return coord ? { ...s, lat: coord.lat, lng: coord.lng } : s;
    }),
  );
}
