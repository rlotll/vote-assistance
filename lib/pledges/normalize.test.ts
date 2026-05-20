import { describe, it, expect } from 'vitest';
import { normalizeCandidatePledges, type RawCandidatePledgeItem } from './normalize';

// 와이드 포맷: 후보 1인 = item 1개, 공약은 prmsTitle{i}/prmmCont{i}/prmsRealmName{i}로 펼쳐짐
const wide = (over: Partial<RawCandidatePledgeItem> = {}): RawCandidatePledgeItem => ({
  cnddtId: 'H1',
  prmsCnt: '2',
  prmsOrd1: '1',
  prmsRealmName1: '경제',
  prmsTitle1: '청년 일자리 확대',
  prmmCont1: '창업 지원과 고용 확대',
  prmsOrd2: '2',
  prmsRealmName2: '환경',
  prmsTitle2: '탄소중립 도시',
  prmmCont2: '재생에너지 전환',
  ...over,
});

describe('normalizeCandidatePledges — 와이드 포맷 펼치기', () => {
  it('prmsCnt만큼 공약을 펼치고 분야명 기반으로 분류', () => {
    const result = normalizeCandidatePledges([wide()], 'H1');
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 'H1-1',
      ownerType: 'candidate',
      ownerId: 'H1',
      category: 'economy',
      title: '청년 일자리 확대',
      body: '창업 지원과 고용 확대',
    });
    expect(result[1].category).toBe('environment');
    expect(result[1].title).toBe('탄소중립 도시');
  });

  it('prmsCnt가 0/없으면 빈 배열', () => {
    expect(normalizeCandidatePledges([wide({ prmsCnt: '0' })], 'H1')).toEqual([]);
    expect(normalizeCandidatePledges([wide({ prmsCnt: undefined })], 'H1')).toEqual([]);
  });

  it('제목이 빈 슬롯은 건너뜀', () => {
    const result = normalizeCandidatePledges([wide({ prmsCnt: '2', prmsTitle2: undefined })], 'H1');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('H1-1');
  });

  it('본문(prmmCont)이 없어도 제목만 있으면 포함, body는 빈 문자열', () => {
    const result = normalizeCandidatePledges([wide({ prmsCnt: '1', prmmCont1: undefined })], 'H1');
    expect(result[0].body).toBe('');
  });

  it('빈 입력은 빈 배열', () => {
    expect(normalizeCandidatePledges([], 'H1')).toEqual([]);
  });
});
