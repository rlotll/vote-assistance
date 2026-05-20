// 모의투표 스텝(투표용지) 구성 — 현재 활성 선거 1종 기준 (S-06, 사용자 결정 2026-05-20)
// 와이어프레임 7스텝(지방선거 동시 시행)은 다선거 통합 시 확장 예정
import { hasProportionalRepresentation } from '@/types/domain';
import { toPosition } from '@/lib/candidates/normalize';
import type { Election, CandidatePosition } from '@/types/domain';

export type BallotKind = 'candidate' | 'party';

export interface MockVoteStep {
  step: number;              // 1-based
  kind: BallotKind;
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

export function buildSteps(election: Election): MockVoteStep[] {
  const draft: Omit<MockVoteStep, 'step'>[] = [];

  if (election.electionType === 'PRESIDENT') {
    draft.push({ kind: 'candidate', position: 'PRESIDENT', label: positionLabel('PRESIDENT') });
  } else if (election.electionType === 'PARLIAMENT') {
    // 1인 2표: 지역구 후보 + 비례 정당
    draft.push({ kind: 'candidate', position: 'PARLIAMENT_MEMBER', label: positionLabel('PARLIAMENT_MEMBER') });
    draft.push({ kind: 'party', label: '비례대표 국회의원 선거' });
  } else {
    // LOCAL: 현재 sgTypecode 직 후보. 교육감은 정당이 없어 비례 제외
    const position = toPosition(election.sgTypecode);
    draft.push({ kind: 'candidate', position, label: positionLabel(position) });
    if (position !== 'EDUCATION_SUPERINTENDENT' && hasProportionalRepresentation(election)) {
      draft.push({ kind: 'party', label: '비례대표 지방의원 선거' });
    }
  }

  return draft.map((s, i) => ({ ...s, step: i + 1 }));
}
