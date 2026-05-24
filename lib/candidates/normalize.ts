// 후보자 정보 API(PofelcddInfoInqireService) 응답 정규화 — api_contract §4.2
// 실측 필드명/코드는 키 발급 후 확정 (api_contract §6)
import { bySymbolNumber } from '@/types/domain';
import type { Candidate, CandidatePosition } from '@/types/domain';

export interface RawCandidateItem {
  huboid: string;        // 후보자 ID
  sgId: string;          // 선거 ID
  sgTypecode: string;    // 선거종류코드 → position 매핑
  sggName?: string;      // 선거구명 (시군구 단위, districtCode로 사용)
  sdName?: string;       // 시도명
  giho?: string;         // 기호번호 (문자열) — 정렬 키 NF-05. 비례대표·교육감·교육의원은 미제공
  num?: string;          // 결과순서 — giho 미제공 시 정렬 대체
  name: string;          // 후보자명
  jdName?: string;       // 정당명 (무소속 시 없음 또는 "무소속")
}

// sgTypecode → CandidatePosition (api_contract §4.1 + project_nec_sgtypecode_mapping)
// 대선 실측값이 "0"으로 관측됨 — 키 발급 후 확정 필요
const POSITION_MAP: Record<string, CandidatePosition> = {
  '0': 'PRESIDENT',
  '1': 'PRESIDENT',
  '2': 'PARLIAMENT_MEMBER',
  '3': 'METRO_HEAD',                 // 시·도지사
  '4': 'LOCAL_HEAD',                 // 구·시·군의장
  '5': 'METRO_COUNCIL',              // 지역구 시·도의원(광역의원)
  '6': 'LOCAL_COUNCIL',              // 지역구 구·시·군의원(기초의원)
  '11': 'EDUCATION_SUPERINTENDENT',  // 교육감
};

export function toPosition(sgTypecode: string): CandidatePosition {
  return POSITION_MAP[sgTypecode] ?? 'PARLIAMENT_MEMBER';
}

export function normalizeCandidate(raw: RawCandidateItem): Candidate {
  const jdName = raw.jdName?.trim() ?? '';
  const isIndependent = jdName === '' || jdName === '무소속';
  // 교육감 등은 giho가 빈 문자열 → 게재순서(num)로 대체. 빈 문자열도 fallback되도록 ||
  const number = parseInt(raw.giho || raw.num || '', 10);
  return {
    id: raw.huboid,
    electionId: raw.sgId,
    districtCode: raw.sggName ?? '',
    number: Number.isNaN(number) ? 0 : number,
    name: raw.name,
    partyId: isIndependent ? null : jdName,
    partyName: isIndependent ? '무소속' : jdName,
    position: toPosition(raw.sgTypecode),
  };
}

// 정규화 + 기호번호 오름차순 정렬 (NF-05 중립성 — 다른 정렬 키 금지)
export function normalizeCandidates(raws: RawCandidateItem[]): Candidate[] {
  return raws.map(normalizeCandidate).sort(bySymbolNumber);
}
