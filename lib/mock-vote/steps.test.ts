import { describe, it, expect } from 'vitest';
import { buildSteps, positionLabel } from './steps';
import type { Election, CandidatePosition } from '@/types/domain';

const election = (over: Partial<Election> = {}): Election => ({
  id: 'E1',
  electionType: 'LOCAL',
  sgTypecode: '3',
  name: '제9회 전국동시지방선거',
  electionDay: '2026-06-03',
  ...over,
});

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
  it('대통령 후보 1스텝만 반환', () => {
    const steps = buildSteps(election({ electionType: 'PRESIDENT', sgTypecode: '1' }));
    expect(steps).toEqual([
      { step: 1, kind: 'candidate', position: 'PRESIDENT', label: '대통령 선거' },
    ]);
  });

  it('sgTypecode와 무관하게 PRESIDENT 분기 (실측 대선 코드 "0"이어도 동일)', () => {
    const steps = buildSteps(election({ electionType: 'PRESIDENT', sgTypecode: '0' }));
    expect(steps).toHaveLength(1);
    expect(steps[0].position).toBe('PRESIDENT');
  });
});

describe('buildSteps — PARLIAMENT (1인 2표)', () => {
  it('지역구 후보 + 비례 정당 2스텝, 순서/번호 보장', () => {
    const steps = buildSteps(election({ electionType: 'PARLIAMENT', sgTypecode: '2' }));
    expect(steps).toEqual([
      { step: 1, kind: 'candidate', position: 'PARLIAMENT_MEMBER', label: '지역구 국회의원 선거' },
      { step: 2, kind: 'party', label: '비례대표 국회의원 선거' },
    ]);
  });

  it('비례 정당 스텝에는 position이 없다', () => {
    const steps = buildSteps(election({ electionType: 'PARLIAMENT' }));
    expect(steps[1].position).toBeUndefined();
  });
});

describe('buildSteps — LOCAL', () => {
  it('광역단체장(sgTypecode "3"): 후보 + 비례 정당 2스텝', () => {
    const steps = buildSteps(election({ sgTypecode: '3' }));
    expect(steps).toEqual([
      { step: 1, kind: 'candidate', position: 'METRO_HEAD', label: '광역단체장 선거' },
      { step: 2, kind: 'party', label: '비례대표 지방의원 선거' },
    ]);
  });

  it('기초단체장(sgTypecode "4"): 후보 + 비례 정당 2스텝', () => {
    const steps = buildSteps(election({ sgTypecode: '4' }));
    expect(steps.map((s) => s.kind)).toEqual(['candidate', 'party']);
    expect(steps[0].position).toBe('LOCAL_HEAD');
  });

  it('교육감(sgTypecode "11"): 정당이 없어 비례 제외, 후보 1스텝만', () => {
    const steps = buildSteps(election({ sgTypecode: '11' }));
    expect(steps).toEqual([
      { step: 1, kind: 'candidate', position: 'EDUCATION_SUPERINTENDENT', label: '교육감 선거' },
    ]);
  });

  it('미확정 sgTypecode는 toPosition fallback(PARLIAMENT_MEMBER) + 비례 정당', () => {
    const steps = buildSteps(election({ sgTypecode: '99' }));
    expect(steps[0].position).toBe('PARLIAMENT_MEMBER');
    expect(steps).toHaveLength(2);
    expect(steps[1].kind).toBe('party');
  });

  it('광역의원(sgTypecode "5"): 후보 + 비례 2스텝', () => {
    const steps = buildSteps(election({ sgTypecode: '5' }));
    expect(steps[0].position).toBe('METRO_COUNCIL');
    expect(steps).toHaveLength(2);
  });
});

describe('buildSteps — 공통 불변식', () => {
  it('step 번호는 항상 1-based 연속', () => {
    for (const e of [
      election({ electionType: 'PRESIDENT', sgTypecode: '1' }),
      election({ electionType: 'PARLIAMENT', sgTypecode: '2' }),
      election({ sgTypecode: '3' }),
      election({ sgTypecode: '11' }),
    ]) {
      const steps = buildSteps(e);
      expect(steps.map((s) => s.step)).toEqual(steps.map((_, i) => i + 1));
    }
  });

  it('모든 candidate 스텝에 position, party 스텝엔 position 없음', () => {
    const steps = buildSteps(election({ sgTypecode: '3' }));
    for (const s of steps) {
      if (s.kind === 'candidate') expect(s.position).toBeDefined();
      else expect(s.position).toBeUndefined();
    }
  });
});
