import { describe, it, expect } from 'vitest';
import { partyBrandColor } from './brand-color';

describe('partyBrandColor', () => {
  it('정당명 키워드를 상징색으로 매핑', () => {
    expect(partyBrandColor('더불어민주당')).toBe('#152484');
    expect(partyBrandColor('국민의힘')).toBe('#E61E2B');
  });

  it('부분 문자열로도 매칭', () => {
    expect(partyBrandColor('정의당')).toBe('#FFCC00');
  });

  it('미등록 정당은 중립 회색', () => {
    expect(partyBrandColor('가나다당')).toBe('#9CA3AF');
  });
});
