import { describe, it, expect } from 'vitest';
import { extractParties, buildPartyGroup } from './normalize';
import type { WidePledgeItem } from '@/lib/pledges/wide-pledges';

const codes = [
  { jdName: '가당', pOrder: '1' },
  { jdName: '나당', pOrder: '2' },
  { jdName: '다당', pOrder: '3' },
];

describe('extractParties — 출마 정당 ∩ 정당코드(pOrder=기호)', () => {
  it('출마 정당에 pOrder 기호를 부여하고 기호 오름차순 정렬', () => {
    const result = extractParties(
      [{ jdName: '다당' }, { jdName: '가당' }, { jdName: '나당' }, { jdName: '가당' }],
      codes,
    );
    expect(result).toEqual([
      { name: '가당', number: 1 },
      { name: '나당', number: 2 },
      { name: '다당', number: 3 },
    ]);
  });

  it('무소속·빈 정당명은 제외', () => {
    const result = extractParties(
      [{ jdName: '무소속' }, { jdName: '' }, { jdName: undefined }, { jdName: '가당' }],
      codes,
    );
    expect(result).toEqual([{ name: '가당', number: 1 }]);
  });

  it('정당코드에 없는 정당은 기호 0', () => {
    expect(extractParties([{ jdName: '신생당' }], codes)).toEqual([{ name: '신생당', number: 0 }]);
  });
});

describe('buildPartyGroup — 정당 + 와이드 정책', () => {
  const policy: WidePledgeItem = {
    prmsCnt: '2',
    prmsTitle1: '청년 일자리',
    prmmCont1: '고용 확대',
    prmsRealmName1: '경제',
    prmsTitle2: '재생에너지',
    prmmCont2: '탄소중립',
    prmsRealmName2: '환경',
  };

  it('정책을 펼쳐 PartyWithPledges 구성', () => {
    const group = buildPartyGroup('국민의힘', 2, [policy]);
    expect(group.party).toEqual({
      id: '국민의힘',
      number: 2,
      name: '국민의힘',
      brandColor: '#E61E2B',
      isProportional: true,
    });
    expect(group.pledges).toHaveLength(2);
    expect(group.pledges[0]).toMatchObject({ ownerType: 'party', ownerId: '국민의힘', category: 'economy' });
    expect(group.pledges[1].category).toBe('environment');
  });

  it('정책 응답이 비면 pledges 빈 배열 (정당은 유지)', () => {
    const group = buildPartyGroup('가당', 1, []);
    expect(group.party.name).toBe('가당');
    expect(group.pledges).toEqual([]);
  });
});
