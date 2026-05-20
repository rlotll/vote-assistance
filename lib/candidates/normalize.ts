// 후보자 정보 API(PofelcddInfoInqireService) 응답 정규화 — api_contract §4.2
// 실측 필드명/코드는 키 발급 후 확정 (api_contract §6)
import { bySymbolNumber } from '@/types/domain';
import type { Candidate, CandidatePosition } from '@/types/domain';

export interface RawCandidateItem {
  huboid: string;        // 후보자 ID
  sgId: string;          // 선거 ID
  sggCityCode?: string;  // 선거구 코드
  sgTypecode: string;    // 선거종류코드 → position 매핑
  gisuk: string;         // 기호번호 (문자열) — 정렬 키 NF-05
  name: string;          // 후보자명
  jdName?: string;       // 정당명 (무소속 시 없음 또는 "무소속")
  photo?: string;        // 사진 URL (응답 필드 존재 시)
}

// sgTypecode → CandidatePosition (api_contract §4.1 + project_nec_sgtypecode_mapping)
// 대선 실측값이 "0"으로 관측됨 — 키 발급 후 확정 필요
const POSITION_MAP: Record<string, CandidatePosition> = {
  '0': 'PRESIDENT',
  '1': 'PRESIDENT',
  '2': 'PARLIAMENT_MEMBER',
  '3': 'METRO_HEAD',                 // 시·도지사
  '4': 'LOCAL_HEAD',                 // 구·시·군의장
  '5': 'METRO_COUNCIL',              // 지역구 광역의원 (코드 미확정)
  '6': 'METRO_COUNCIL',              // 비례 광역의원
  '7': 'LOCAL_COUNCIL',              // 지역구 기초의원
  '8': 'LOCAL_COUNCIL',              // 비례 기초의원
  '11': 'EDUCATION_SUPERINTENDENT',  // 교육감
};

export function toPosition(sgTypecode: string): CandidatePosition {
  return POSITION_MAP[sgTypecode] ?? 'PARLIAMENT_MEMBER';
}

export function normalizeCandidate(raw: RawCandidateItem): Candidate {
  const jdName = raw.jdName?.trim() ?? '';
  const isIndependent = jdName === '' || jdName === '무소속';
  return {
    id: raw.huboid,
    electionId: raw.sgId,
    districtCode: raw.sggCityCode ?? '',
    number: parseInt(raw.gisuk, 10),
    name: raw.name,
    partyId: isIndependent ? null : jdName,
    partyName: isIndependent ? '무소속' : jdName,
    position: toPosition(raw.sgTypecode),
    photoUrl: raw.photo || undefined,
  };
}

// 정규화 + 기호번호 오름차순 정렬 (NF-05 중립성 — 다른 정렬 키 금지)
export function normalizeCandidates(raws: RawCandidateItem[]): Candidate[] {
  return raws.map(normalizeCandidate).sort(bySymbolNumber);
}
