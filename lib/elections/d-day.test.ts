import { describe, it, expect } from 'vitest';
import { shiftDateKst, calculateDday, formatDdayLabel } from './d-day';

describe('shiftDateKst', () => {
  it('일수를 더한다', () => {
    expect(shiftDateKst('2026-06-03', 7)).toBe('2026-06-10');
  });

  it('월 경계를 넘는다', () => {
    expect(shiftDateKst('2026-05-31', 1)).toBe('2026-06-01');
  });

  it('음수로 과거 날짜를 만든다', () => {
    expect(shiftDateKst('2026-06-01', -1)).toBe('2026-05-31');
  });

  it('윤년 2월 말을 처리한다', () => {
    expect(shiftDateKst('2024-02-28', 1)).toBe('2024-02-29');
  });
});

describe('calculateDday', () => {
  // KST 정오로 today를 고정 — 자정 경계 흔들림 방지
  const at = (kstDate: string) => new Date(`${kstDate}T03:00:00.000Z`); // KST 12:00

  it('선거 전이면 양수(D-N)', () => {
    expect(calculateDday('2026-06-03', at('2026-05-27'))).toBe(7);
  });

  it('선거 당일이면 0(D-DAY)', () => {
    expect(calculateDday('2026-06-03', at('2026-06-03'))).toBe(0);
  });

  it('선거 종료 후면 음수', () => {
    expect(calculateDday('2026-06-03', at('2026-06-05'))).toBe(-2);
  });
});

describe('formatDdayLabel', () => {
  it('양수는 D-N', () => {
    expect(formatDdayLabel(7)).toBe('D-7');
  });

  it('0은 D-DAY', () => {
    expect(formatDdayLabel(0)).toBe('D-DAY');
  });

  it('음수는 D+N', () => {
    expect(formatDdayLabel(-2)).toBe('D+2');
  });
});
