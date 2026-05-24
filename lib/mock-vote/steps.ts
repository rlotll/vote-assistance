// 모의투표 스텝(투표용지) 구성 — 와이어프레임 S-06: 그 선거일의 여러 투표용지를 순차 진행.
// 대선/총선은 단일(또는 1인2표) 구성, 지방선거는 동시 시행 종류를 와이어프레임 순서로 나열.
import { sgTypeMeta } from '@/lib/elections/sg-type';
import { toPosition } from '@/lib/candidates/normalize';
import type { Election, CandidatePosition } from '@/types/domain';

export type BallotKind = 'candidate' | 'party';

export interface MockVoteStep {
  step: number;              // 1-based
  kind: BallotKind;
  sgTypecode: string;        // 이 투표용지의 선거 종류 (스텝별 후보/정당 조회 키)
  position?: CandidatePosition; // candidate 스텝에만 존재
  label: string;
}

const POSITION_LABEL: Record<CandidatePosition, string> = {
  PRESIDENT: '대통령 선거',
  PARLIAMENT_MEMBER: '지역구 국회의원 선거',
  EDUCATION_SUPERINTENDENT: '교육감 선거',
  METRO_HEAD: '광역단체장 선거',
  LOCAL_HEAD: '기초단체장 선거',
  METRO_COUNCIL: '광역의원 선거',
  LOCAL_COUNCIL: '기초의원 선거',
};

export function positionLabel(position: CandidatePosition): string {
  return POSITION_LABEL[position];
}

// 지방선거 투표용지 순서 (와이어프레임 S-06). 여기 정의된 종류만 LOCAL 스텝에 포함(type=0 대표코드·국회의원 재보선 등 제외)
const LOCAL_STEP_ORDER: Record<string, number> = {
  '11': 1, // 교육감
  '3': 2, // 시·도지사
  '4': 3, // 구·시·군의장
  '5': 4, // 지역구 시·도의원(광역의원)
  '8': 5, // 비례대표 시·도의원(광역의원)
  '6': 6, // 지역구 구·시·군의원(기초의원)
  '9': 7, // 비례대표 구·시·군의원(기초의원)
};

function localStep(sgTypecode: string, step: number): MockVoteStep {
  const meta = sgTypeMeta(sgTypecode);
  const label = `${meta.label} 선거`;
  return meta.isProportional
    ? { step, kind: 'party', sgTypecode, label }
    : { step, kind: 'candidate', sgTypecode, position: toPosition(sgTypecode), label };
}

// election: 활성 선거(종류 분기용), electionTypes: 같은 선거일의 모든 종류(지방선거 다스텝 구성용)
export function buildSteps(election: Election, electionTypes: Election[] = []): MockVoteStep[] {
  if (election.electionType === 'PRESIDENT') {
    return [
      { step: 1, kind: 'candidate', sgTypecode: election.sgTypecode, position: 'PRESIDENT', label: positionLabel('PRESIDENT') },
    ];
  }
  if (election.electionType === 'PARLIAMENT') {
    // 1인 2표: 지역구 후보 + 비례 정당(국회의원 비례 = sgTypecode 7)
    return [
      { step: 1, kind: 'candidate', sgTypecode: election.sgTypecode, position: 'PARLIAMENT_MEMBER', label: positionLabel('PARLIAMENT_MEMBER') },
      { step: 2, kind: 'party', sgTypecode: '7', label: '비례대표 국회의원 선거' },
    ];
  }

  // LOCAL: 그 선거일의 지방선거 종류들을 와이어프레임 순서로 (electionTypes 없으면 활성 선거 단독)
  const source = electionTypes.length > 0 ? electionTypes : [election];
  return source
    .filter((e) => e.sgTypecode in LOCAL_STEP_ORDER)
    .sort((a, b) => LOCAL_STEP_ORDER[a.sgTypecode] - LOCAL_STEP_ORDER[b.sgTypecode])
    .map((e, i) => localStep(e.sgTypecode, i + 1));
}
