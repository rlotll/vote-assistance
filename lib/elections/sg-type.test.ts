import { describe, it, expect } from 'vitest';
import { sgTypeMeta, isCandidateType, hasPledgeData } from './sg-type';

describe('sgTypeMeta', () => {
  it('시도지사·교육감은 시도 단위(scope=sido)', () => {
    expect(sgTypeMeta('3').scope).toBe('sido');
    expect(sgTypeMeta('11').scope).toBe('sido');
  });

  it('구·시·군의장/의원은 시군구 단위(scope=sigungu)', () => {
    expect(sgTypeMeta('4').scope).toBe('sigungu');
    expect(sgTypeMeta('5').scope).toBe('sigungu');
  });

  it('미확정 코드는 fallback', () => {
    expect(sgTypeMeta('99').label).toBe('기타 선거');
  });
});

describe('isCandidateType — 후보자(인물) 탭 노출 여부', () => {
  it('지역구 선거는 true', () => {
    expect(isCandidateType('2')).toBe(true); // 국회의원
    expect(isCandidateType('3')).toBe(true); // 시도지사
    expect(isCandidateType('4')).toBe(true); // 구시군장
    expect(isCandidateType('5')).toBe(true); // 지역구 시도의원
    expect(isCandidateType('6')).toBe(true); // 지역구 구시군의원
    expect(isCandidateType('11')).toBe(true); // 교육감
  });

  it('비례대표는 false', () => {
    expect(isCandidateType('7')).toBe(false); // 국회의원 비례
    expect(isCandidateType('8')).toBe(false); // 광역의원 비례
    expect(isCandidateType('9')).toBe(false); // 기초의원 비례
  });

  it('통합코드(0)는 false', () => {
    expect(isCandidateType('0')).toBe(false);
  });
});

describe('hasPledgeData — NEC 공약서 제공 종류 (명세 §4-2 주의4)', () => {
  it('대통령·시도지사·구시군장·교육감만 true', () => {
    expect(hasPledgeData('1')).toBe(true);
    expect(hasPledgeData('3')).toBe(true);
    expect(hasPledgeData('4')).toBe(true);
    expect(hasPledgeData('11')).toBe(true);
  });

  it('시도의원·구시군의원·국회의원 등은 false', () => {
    expect(hasPledgeData('2')).toBe(false); // 국회의원
    expect(hasPledgeData('5')).toBe(false); // 시도의원
    expect(hasPledgeData('6')).toBe(false); // 구시군의원
  });
});
