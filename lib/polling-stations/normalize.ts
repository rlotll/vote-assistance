// 투표소 API(PolplcInfoInqireService2) 응답 정규화 — 명세 §2 + 실측
// 사전투표소(getPrePolplc…)·선거일투표소(getPolplc…) 공통. 응답에 좌표·운영시간 필드 없음.
import type { PollingStation } from '@/types/domain';

export interface RawPollingStationItem {
  num?: string;
  evPsName?: string;   // 사전투표소명
  psName?: string;     // 선거일투표소명
  placeName?: string;  // 건물/장소명
  addr: string;        // 주소
  emdName?: string;    // 읍면동명
  floor?: string;      // 층
}

// 응답에 운영시간 필드가 없음 — 공직선거법 기준 고정값 (사전/선거일 모두 06:00~18:00)
const VOTING_HOURS = '06:00 ~ 18:00';

export function normalizeStation(
  raw: RawPollingStationItem,
  index: number,
  isEarlyVoting: boolean,
): PollingStation {
  const floor = raw.floor?.trim();
  return {
    // 사전/선거일 num이 겹치므로 종류 prefix로 id 충돌 방지
    id: `${isEarlyVoting ? 'pre' : 'day'}-${raw.num ?? index}`,
    name: raw.evPsName ?? raw.psName ?? raw.placeName ?? '',
    // 좌표 검색(Geocoder)은 순수 도로명/지번만 인식하므로 address는 층 미포함
    address: raw.addr,
    floor: floor || undefined,
    lat: 0, // 응답에 좌표 미제공 — 클라이언트 Kakao Geocoder로 보강 (useGeocodedStations)
    lng: 0,
    hours: VOTING_HOURS,
    isEarlyVoting,
  };
}
