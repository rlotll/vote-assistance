// 도메인 모델 SSOT — docs/domain_model.md 기준
// 모든 화면 컴포넌트와 스토어는 이 파일에서 import

export type ElectionType = 'PRESIDENT' | 'PARLIAMENT' | 'LOCAL';

export interface Election {
  id: string;
  electionType: ElectionType;
  sgTypecode: string;         // raw NEC 코드 — 선거구/후보자 API 필수 파라미터
  name: string;
  electionDay: string;       // ISO date "2027-03-03"
  earlyVotingStart?: string;  // ISO date — API 미제공 시 T-09에서 선거법 기준 계산
  earlyVotingEnd?: string;    // ISO date
}

export interface Sido {
  code: string;  // "11"
  name: string;  // "서울특별시"
}

export interface Sigungu {
  code: string;          // "11680"
  name: string;          // "강남구"
  sidoCode: string;
  districtCode: string;  // 후보자/공약 조회 키
}

export interface District {
  sido: Sido;
  sigungu: Sigungu;
}

export interface Party {
  id: string;
  number: number;           // 기호 번호 (정렬 키 — NF-05)
  name: string;
  brandColor: string;       // hex
  isProportional: boolean;
}

export type CandidatePosition =
  | 'PRESIDENT'
  | 'PARLIAMENT_MEMBER'
  | 'EDUCATION_SUPERINTENDENT'
  | 'METRO_HEAD'
  | 'LOCAL_HEAD'
  | 'METRO_COUNCIL'
  | 'LOCAL_COUNCIL';

export interface Candidate {
  id: string;
  electionId: string;
  districtCode: string;
  number: number;              // 기호 번호 (정렬 키 — NF-05)
  name: string;
  partyId: string | null;      // 무소속 = null (정당 마스터 매핑 전 임시로 정당명 사용)
  partyName: string;           // 소속 정당명 표시용 (무소속 = '무소속') — S-04 후보 카드
  position: CandidatePosition;
  photoUrl?: string;
}

export type PledgeCategory =
  | 'economy'
  | 'housing'
  | 'environment'
  | 'education'
  | 'welfare';

export interface Pledge {
  id: string;
  ownerType: 'candidate' | 'party';
  ownerId: string;         // candidateId 또는 partyId
  category: PledgeCategory;
  title: string;
  body: string;
  sourceUrl?: string;      // F-15 원문 출처
}

// 정당 + 소속 정책 묶음 — S-05 정당 카드 뷰모델 (정당정책 API 응답을 정당별로 그룹핑)
export interface PartyWithPledges {
  party: Party;
  pledges: Pledge[];
}

export interface PollingStation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  hours: string;           // "06:00 ~ 18:00"
  isEarlyVoting: boolean;
}

// 기호 번호 오름차순 정렬 — 다른 정렬 키 사용 금지 (NF-05)
export function bySymbolNumber<T extends { number: number }>(a: T, b: T): number {
  return a.number - b.number;
}

// 도메인 유도 함수
export function daysUntil(election: Election, today: Date): number {
  const target = new Date(election.electionDay);
  const diff = target.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function isEarlyVotingPeriod(election: Election, today: Date): boolean {
  if (!election.earlyVotingStart || !election.earlyVotingEnd) return false;
  const start = new Date(election.earlyVotingStart);
  const end = new Date(election.earlyVotingEnd);
  return today >= start && today <= end;
}

// 비례대표 탭(S-05) 활성화 조건 — LOCAL 선거에서만 비례 정당 탭 표시
export function hasProportionalRepresentation(election: Election): boolean {
  return election.electionType === 'LOCAL';
}
