// 투표소 API(PolplcInfoInqireService2) 응답 정규화 — route handler에서 분리한 순수 로직
import type { PollingStation } from '@/types/domain';

// PolplcInfoInqireService2 응답 항목 — 실측 필드명은 키 발급 후 확정 (api_contract §6)
export interface RawPollingStationItem {
  pollPlaceId?: string;    // 투표소 ID (필드명 미확정)
  pollPlaceName: string;   // 투표소명
  placeAddr: string;       // 주소
  xcoord?: string;         // 경도 (WGS84 여부 미확정 — 없으면 0 fallback)
  ycoord?: string;         // 위도 (TM좌표 가능성 있음 — T-19 Geocoder 보강 범위)
  openTime?: string;       // 운영 시작 (포맷 미확정)
  closeTime?: string;      // 운영 종료 (포맷 미확정)
  votingTime?: string;     // 통합 운영시간 문자열 (포맷 미확정)
  preVoteYn?: string;      // 사전투표소 여부 ("Y"/"N" 추정)
}

// "20260603 06:00" 또는 "06:00" 등 다양한 포맷 → "HH:MM" 추출
export function extractTime(raw: string | undefined): string {
  if (!raw) return '';
  const match = raw.match(/(\d{2}:\d{2})/);
  return match ? match[1] : raw;
}

// 운영시간 정규화 → "HH:MM ~ HH:MM"
export function normalizeHours(item: RawPollingStationItem): string {
  if (item.votingTime) return item.votingTime.trim();
  const open = extractTime(item.openTime);
  const close = extractTime(item.closeTime);
  if (open && close) return `${open} ~ ${close}`;
  return '06:00 ~ 18:00'; // 선거법 기준 fallback
}

export function normalizeStation(raw: RawPollingStationItem, index: number): PollingStation {
  return {
    id: raw.pollPlaceId ?? String(index),
    name: raw.pollPlaceName,
    address: raw.placeAddr,
    lat: raw.ycoord ? parseFloat(raw.ycoord) : 0,
    lng: raw.xcoord ? parseFloat(raw.xcoord) : 0,
    hours: normalizeHours(raw),
    isEarlyVoting: raw.preVoteYn === 'Y',
  };
}
