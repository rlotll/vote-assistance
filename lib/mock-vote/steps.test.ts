import { describe, it, expect } from 'vitest';
import { buildSteps, positionLabel } from './steps';
import type { Election, CandidatePosition } from '@/types/domain';

const election = (over: Partial<Election> = {}): Election => ({
  id: 'E1',
  electionType: 'LOCAL',
  sgTypecode: '0',
  name: '제9회 전국동시지방선거',
  electionDay: '2026-06-03',
  ...over,
});

const types = (codes: string[]): Election[] => codes.map((c) => election({ sgTypecode: c }));

describe('positionLabel', () => {
  it('모든 CandidatePosition에 한글 라벨을 반환', () => {
    const cases: Record<CandidatePosition, string> = {
      PRESIDENT: '대통령 선거',
      PARLIAMENT_MEMBER: '지역구 국회의원 선거',
      EDUCATION_SUPERINTENDENT: '교육감 선거',
      METRO_HEAD: '광역단체장 선거',
      LOCAL_HEAD: '기초단체장 선거',
      METRO_COUNCIL: '광역의원 선거',
      LOCAL_COUNCIL: '기초의원 선거',
    };
    for (const [pos, label] of Object.entries(cases) as [CandidatePosition, string][]) {
      expect(positionLabel(pos)).toBe(label);
    }
  });
});

describe('buildSteps — PRESIDENT', () => {
  it('대통령 후보 1스텝, sgTypecode 보존', () => {
    const steps = buildSteps(election({ electionType: 'PRESIDENT', sgTypecode: '1' }));
    expect(steps).toEqual([
      { step: 1, kind: 'candidate', sgTypecode: '1', position: 'PRESIDENT', label: '대통령 선거' },
    ]);
  });
});

describe('buildSteps — PARLIAMENT (1인 2표)', () => {
  it('지역구 후보 + 비례 정당(국회 비례=7) 2스텝', () => {
    const steps = buildSteps(election({ electionType: 'PARLIAMENT', sgTypecode: '2' }));
    expect(steps).toEqual([
      { step: 1, kind: 'candidate', sgTypecode: '2', position: 'PARLIAMENT_MEMBER', label: '지역구 국회의원 선거' },
      { step: 2, kind: 'party', sgTypecode: '7', label: '비례대표 국회의원 선거' },
    ]);
  });
});

describe('buildSteps — LOCAL (여러 투표용지 순차)', () => {
  it('지방선거 종류를 와이어프레임 순서로 구성하고 type=0은 제외', () => {
    const steps = buildSteps(election({ sgTypecode: '0' }), types(['0', '8', '3', '11', '4', '6', '5', '9']));
    expect(steps.map((s) => s.sgTypecode)).toEqual(['11', '3', '4', '5', '8', '6', '9']);
    expect(steps.map((s) => s.step)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('교육감은 candidate, 비례 종류는 party(position 없음)', () => {
    const steps = buildSteps(election(), types(['11', '8']));
    expect(steps.find((s) => s.sgTypecode === '11')).toMatchObject({
      kind: 'candidate',
      position: 'EDUCATION_SUPERINTENDENT',
    });
    const prop = steps.find((s) => s.sgTypecode === '8')!;
    expect(prop.kind).toBe('party');
    expect(prop.position).toBeUndefined();
  });

  it('STEP_ORDER에 없는 종류(국회의원 2)는 지방선거 스텝에서 제외', () => {
    const steps = buildSteps(election(), types(['2', '3']));
    expect(steps.map((s) => s.sgTypecode)).toEqual(['3']);
  });

  it('electionTypes가 없으면 활성 선거 단독 구성', () => {
    const steps = buildSteps(election({ sgTypecode: '3' }));
    expect(steps).toHaveLength(1);
    expect(steps[0]).toMatchObject({ kind: 'candidate', sgTypecode: '3', position: 'METRO_HEAD' });
  });
});

describe('buildSteps — 공통 불변식', () => {
  it('step 번호는 항상 1-based 연속', () => {
    const steps = buildSteps(election({ sgTypecode: '0' }), types(['11', '3', '4', '5', '8']));
    expect(steps.map((s) => s.step)).toEqual(steps.map((_, i) => i + 1));
  });

  it('candidate 스텝엔 position, party 스텝엔 position 없음', () => {
    const steps = buildSteps(election(), types(['3', '8']));
    for (const s of steps) {
      if (s.kind === 'candidate') expect(s.position).toBeDefined();
      else expect(s.position).toBeUndefined();
    }
  });
});
