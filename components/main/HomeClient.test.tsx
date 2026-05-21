// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import type { Election } from '@/types/domain';

// useElection을 모킹해 각 상태(로딩/성공/에러/없음)를 주입한다.
const mockUseElection = vi.fn();
vi.mock('@/hooks/useElection', () => ({
  useElection: () => mockUseElection(),
}));

// 자식 배너 컴포넌트는 식별 가능한 testid로 대체해 HomeClient의 분기 선택만 검증한다.
// DdayBannerError는 실제 컴포넌트를 렌더해 role="alert"·"다시 시도" 버튼·onRetry를 함께 검증한다.
vi.mock('./DdayBanner', () => ({
  DdayBanner: ({ election, dday }: { election: Election; dday: number }) => (
    <div data-testid="dday-banner">{`${election.name}:${dday}`}</div>
  ),
}));
vi.mock('./DdayBannerLoading', () => ({
  DdayBannerLoading: () => <div data-testid="dday-loading" role="status" aria-busy="true" />,
}));
vi.mock('./NoElectionNotice', () => ({
  NoElectionNotice: () => <div data-testid="no-election" />,
}));
// DistrictSummary / QuickMenu는 항상 렌더되는지만 보면 되므로 가볍게 스텁한다.
vi.mock('./DistrictSummary', () => ({
  DistrictSummary: () => <div data-testid="district-summary" />,
}));
vi.mock('./QuickMenu', () => ({
  QuickMenu: () => <div data-testid="quick-menu" />,
}));

import { HomeClient } from './HomeClient';

const election: Election = {
  id: 'E1',
  electionType: 'LOCAL',
  sgTypecode: '0',
  name: '제9회 전국동시지방선거',
  electionDay: '2026-06-03',
};

// useElection 반환 형태의 기본값 — 각 테스트에서 필요한 필드만 덮어쓴다.
const baseReturn = {
  election: null,
  electionTypes: [],
  isLoading: false,
  isError: false,
  apiError: null,
  refetch: vi.fn(),
  dday: null,
};

beforeEach(() => {
  mockUseElection.mockReset();
});

afterEach(() => {
  cleanup();
});

describe('HomeClient 분기', () => {
  it('isLoading=true면 로딩 배너(role=status)를 렌더한다', () => {
    mockUseElection.mockReturnValue({ ...baseReturn, isLoading: true });
    render(<HomeClient />);

    const loading = screen.getByTestId('dday-loading');
    expect(loading).toBeTruthy();
    expect(loading.getAttribute('role')).toBe('status');
    expect(loading.getAttribute('aria-busy')).toBe('true');

    // 다른 배너는 뜨지 않는다
    expect(screen.queryByTestId('dday-banner')).toBeNull();
    expect(screen.queryByTestId('no-election')).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('election과 dday가 있으면 D-day 배너를 렌더한다', () => {
    mockUseElection.mockReturnValue({ ...baseReturn, election, dday: 13 });
    render(<HomeClient />);

    expect(screen.getByTestId('dday-banner').textContent).toBe('제9회 전국동시지방선거:13');
    expect(screen.queryByTestId('dday-loading')).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('dday=0(D-DAY)도 dday!==null이므로 D-day 배너를 렌더한다', () => {
    // 경계값: 0은 falsy지만 분기는 null 비교라 배너를 보여야 한다
    mockUseElection.mockReturnValue({ ...baseReturn, election, dday: 0 });
    render(<HomeClient />);

    expect(screen.getByTestId('dday-banner').textContent).toBe('제9회 전국동시지방선거:0');
  });

  it('apiError가 있으면 에러 배너(role=alert)를 렌더한다', () => {
    mockUseElection.mockReturnValue({
      ...baseReturn,
      apiError: { code: 'UPSTREAM_5XX', message: '서버 오류', retryable: true },
      isError: true,
    });
    render(<HomeClient />);

    const alert = screen.getByRole('alert');
    expect(alert).toBeTruthy();
    expect(screen.getByText('선거 정보를 불러오지 못했어요')).toBeTruthy();

    // 과거 갭: apiError 시 아무것도 안 뜨던 문제가 에러 배너로 메워졌는지 확인
    expect(screen.queryByTestId('no-election')).toBeNull();
    expect(screen.queryByTestId('dday-banner')).toBeNull();
    expect(screen.queryByTestId('dday-loading')).toBeNull();
  });

  it('에러 배너의 "다시 시도" 버튼 클릭 시 refetch가 호출된다', () => {
    const refetch = vi.fn();
    mockUseElection.mockReturnValue({
      ...baseReturn,
      apiError: { code: 'UPSTREAM_5XX', message: '서버 오류', retryable: true },
      isError: true,
      refetch,
    });
    render(<HomeClient />);

    fireEvent.click(screen.getByRole('button', { name: /다시 시도/ }));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it('로딩 아님 + election 없음 + 에러 없음이면 NoElectionNotice를 렌더한다', () => {
    mockUseElection.mockReturnValue({ ...baseReturn });
    render(<HomeClient />);

    expect(screen.getByTestId('no-election')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(screen.queryByTestId('dday-banner')).toBeNull();
  });

  it('election은 있지만 dday=null이면(이론상) 에러 없을 때 NoElectionNotice로 떨어진다', () => {
    // 두번째 분기 조건은 (election && dday !== null) — dday만 null이면 다음 분기로 넘어간다
    mockUseElection.mockReturnValue({ ...baseReturn, election, dday: null });
    render(<HomeClient />);

    expect(screen.getByTestId('no-election')).toBeTruthy();
    expect(screen.queryByTestId('dday-banner')).toBeNull();
  });

  it('모든 분기에서 DistrictSummary와 QuickMenu는 항상 렌더된다', () => {
    const states = [
      { ...baseReturn, isLoading: true },
      { ...baseReturn, election, dday: 5 },
      { ...baseReturn, apiError: { code: 'UPSTREAM_5XX', message: 'x', retryable: true }, isError: true },
      { ...baseReturn },
    ];

    for (const state of states) {
      mockUseElection.mockReturnValue(state);
      render(<HomeClient />);
      expect(screen.getByTestId('district-summary')).toBeTruthy();
      expect(screen.getByTestId('quick-menu')).toBeTruthy();
      cleanup();
    }
  });
});
