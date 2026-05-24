import { describe, it, expect } from 'vitest';
import { toPosition, normalizeCandidate, normalizeCandidates, type RawCandidateItem } from './normalize';

const raw = (over: Partial<RawCandidateItem> = {}): RawCandidateItem => ({
  huboid: 'H1',
  sgId: '20270303',
  sggName: '강남구',
  sgTypecode: '1',
  giho: '1',
  name: '홍길동',
  jdName: '가나다당',
  ...over,
});

describe('toPosition', () => {
  it('대선 코드 1과 실측 0 모두 PRESIDENT', () => {
    expect(toPosition('1')).toBe('PRESIDENT');
    expect(toPosition('0')).toBe('PRESIDENT');
  });

  it('주요 sgTypecode 매핑', () => {
    expect(toPosition('2')).toBe('PARLIAMENT_MEMBER');
    expect(toPosition('3')).toBe('METRO_HEAD');
    expect(toPosition('4')).toBe('LOCAL_HEAD');
    expect(toPosition('5')).toBe('METRO_COUNCIL'); // 지역구 시·도의원
    expect(toPosition('6')).toBe('LOCAL_COUNCIL'); // 지역구 구·시·군의원
    expect(toPosition('11')).toBe('EDUCATION_SUPERINTENDENT');
  });

  it('미확정 코드는 PARLIAMENT_MEMBER로 fallback', () => {
    expect(toPosition('99')).toBe('PARLIAMENT_MEMBER');
  });
});

describe('normalizeCandidate', () => {
  it('필드를 도메인 모델로 매핑하고 giho를 숫자로 변환', () => {
    expect(normalizeCandidate(raw({ giho: '2' }))).toEqual({
      id: 'H1',
      electionId: '20270303',
      districtCode: '강남구',
      number: 2,
      name: '홍길동',
      partyId: '가나다당',
      partyName: '가나다당',
      position: 'PRESIDENT',
    });
  });

  it('정당이 있으면 partyId=partyName=정당명', () => {
    const c = normalizeCandidate(raw({ jdName: '라마바당' }));
    expect(c.partyId).toBe('라마바당');
    expect(c.partyName).toBe('라마바당');
  });

  it('jdName이 "무소속"이면 partyId=null, partyName="무소속"', () => {
    const c = normalizeCandidate(raw({ jdName: '무소속' }));
    expect(c.partyId).toBeNull();
    expect(c.partyName).toBe('무소속');
  });

  it('jdName이 없으면 무소속 처리', () => {
    const c = normalizeCandidate(raw({ jdName: undefined }));
    expect(c.partyId).toBeNull();
    expect(c.partyName).toBe('무소속');
  });

  it('sggName 없으면 빈 문자열', () => {
    expect(normalizeCandidate(raw({ sggName: undefined })).districtCode).toBe('');
  });

  it('giho 미제공(비례·교육감) 시 num으로 대체, 둘 다 없으면 0', () => {
    expect(normalizeCandidate(raw({ giho: undefined, num: '3' })).number).toBe(3);
    expect(normalizeCandidate(raw({ giho: '', num: '2' })).number).toBe(2); // 교육감: giho 빈 문자열
    expect(normalizeCandidate(raw({ giho: undefined, num: undefined })).number).toBe(0);
  });
});

describe('normalizeCandidates — 기호순 정렬 (NF-05 중립성)', () => {
  it('입력 순서와 무관하게 기호번호 오름차순으로 정렬', () => {
    const result = normalizeCandidates([
      raw({ huboid: 'C', giho: '3' }),
      raw({ huboid: 'A', giho: '1' }),
      raw({ huboid: 'B', giho: '2' }),
    ]);
    expect(result.map((c) => c.number)).toEqual([1, 2, 3]);
    expect(result.map((c) => c.id)).toEqual(['A', 'B', 'C']);
  });

  it('빈 배열은 빈 배열', () => {
    expect(normalizeCandidates([])).toEqual([]);
  });
});
