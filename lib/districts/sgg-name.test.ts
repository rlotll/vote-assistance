import { describe, it, expect } from 'vitest';
import { toCandidateSggName } from './sgg-name';

describe('toCandidateSggName — 행정구는 시 단위로 축약', () => {
  it('일반시 행정구는 시까지로 축약', () => {
    expect(toCandidateSggName('고양시덕양구')).toBe('고양시');
    expect(toCandidateSggName('성남시분당구')).toBe('성남시');
    expect(toCandidateSggName('수원시영통구')).toBe('수원시');
    expect(toCandidateSggName('창원시마산합포구')).toBe('창원시');
    expect(toCandidateSggName('청주시상당구')).toBe('청주시');
  });

  it('광역시 자치구는 그대로 (자체 구청장)', () => {
    expect(toCandidateSggName('해운대구')).toBe('해운대구');
    expect(toCandidateSggName('종로구')).toBe('종로구');
    expect(toCandidateSggName('미추홀구')).toBe('미추홀구');
  });

  it('자치시·군은 그대로', () => {
    expect(toCandidateSggName('진주시')).toBe('진주시');
    expect(toCandidateSggName('양평군')).toBe('양평군');
    expect(toCandidateSggName('기장군')).toBe('기장군');
  });
});
