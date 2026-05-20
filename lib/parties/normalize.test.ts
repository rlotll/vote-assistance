import { describe, it, expect } from 'vitest';
import { normalizePartyPledges, type RawPartyPledgeItem } from './normalize';

const raw = (over: Partial<RawPartyPledgeItem> = {}): RawPartyPledgeItem => ({
  jdName: '가나다당',
  jdSym: '1',
  prmsTitle: '청년 일자리 확대',
  prmsCn: '창업 지원',
  ...over,
});

describe('normalizePartyPledges — 그룹핑', () => {
  it('같은 정당의 정책을 하나의 그룹으로 묶는다', () => {
    const groups = normalizePartyPledges([
      raw({ jdName: '가나다당', jdSym: '1', prmsTitle: '정책A' }),
      raw({ jdName: '가나다당', jdSym: '1', prmsTitle: '정책B' }),
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0].pledges.map((p) => p.title)).toEqual(['정책A', '정책B']);
  });

  it('정책의 ownerType은 party, ownerId는 정당명', () => {
    const groups = normalizePartyPledges([raw()]);
    expect(groups[0].pledges[0].ownerType).toBe('party');
    expect(groups[0].pledges[0].ownerId).toBe('가나다당');
  });

  it('본문 기반으로 분야를 분류한다', () => {
    const groups = normalizePartyPledges([
      raw({ prmsTitle: '재생에너지 확대', prmsCn: '탄소 중립' }),
    ]);
    expect(groups[0].pledges[0].category).toBe('environment');
  });
});

describe('normalizePartyPledges — 기호순 정렬 (NF-05)', () => {
  it('정당을 기호번호 오름차순으로 정렬', () => {
    const groups = normalizePartyPledges([
      raw({ jdName: '다당', jdSym: '3' }),
      raw({ jdName: '가당', jdSym: '1' }),
      raw({ jdName: '나당', jdSym: '2' }),
    ]);
    expect(groups.map((g) => g.party.number)).toEqual([1, 2, 3]);
    expect(groups.map((g) => g.party.name)).toEqual(['가당', '나당', '다당']);
  });

  it('정당 색상과 비례 플래그를 채운다', () => {
    const groups = normalizePartyPledges([raw({ jdName: '국민의힘', jdSym: '2' })]);
    expect(groups[0].party.brandColor).toBe('#E61E2B');
    expect(groups[0].party.isProportional).toBe(true);
  });

  it('빈 입력은 빈 배열', () => {
    expect(normalizePartyPledges([])).toEqual([]);
  });
});
