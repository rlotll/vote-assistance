import { describe, it, expect } from 'vitest';
import { classifyPledge } from './category-classifier';

describe('classifyPledge', () => {
  it('카테고리별 대표 키워드로 분류', () => {
    expect(classifyPledge('청년 일자리와 창업 지원 확대')).toBe('economy');
    expect(classifyPledge('청년 임대주택 공급 및 전세 대출')).toBe('housing');
    expect(classifyPledge('탄소 중립과 재생에너지 전환')).toBe('environment');
    expect(classifyPledge('공교육 강화와 사교육 부담 경감')).toBe('education');
    expect(classifyPledge('노인 돌봄과 의료 복지 확충')).toBe('welfare');
  });

  it('키워드가 가장 많은 카테고리로 분류', () => {
    // welfare 2개(돌봄, 연금) vs economy 1개(일자리)
    expect(classifyPledge('어르신 돌봄과 기초연금 인상, 일자리도 일부')).toBe('welfare');
  });

  it('키워드가 없으면 economy로 fallback', () => {
    expect(classifyPledge('지역 화합과 소통의 정치')).toBe('economy');
  });

  it('동점이면 선언 순서가 빠른 카테고리 우선', () => {
    // economy 1개(경제) vs housing 1개(주택) → economy가 먼저 선언됨
    expect(classifyPledge('경제와 주택')).toBe('economy');
  });

  it('prmsRealmName 등 분야명이 섞여도 키워드로 분류', () => {
    expect(classifyPledge('환경 기후위기 대응 환경')).toBe('environment');
  });
});
