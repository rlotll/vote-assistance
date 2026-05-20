import { describe, it, expect } from 'vitest';
import { extractTime, normalizeHours, normalizeStation, type RawPollingStationItem } from './normalize';

describe('extractTime', () => {
  it('"YYYYMMDD HH:MM"에서 HH:MM만 추출', () => {
    expect(extractTime('20260603 06:00')).toBe('06:00');
  });

  it('이미 "HH:MM"이면 그대로', () => {
    expect(extractTime('18:00')).toBe('18:00');
  });

  it('undefined면 빈 문자열', () => {
    expect(extractTime(undefined)).toBe('');
  });

  it('시각 패턴이 없으면 원본 반환(fallback)', () => {
    expect(extractTime('상시')).toBe('상시');
  });
});

describe('normalizeHours', () => {
  const base: RawPollingStationItem = { pollPlaceName: 'X', placeAddr: 'Y' };

  it('votingTime이 있으면 trim해서 우선 사용', () => {
    expect(normalizeHours({ ...base, votingTime: '  06:00 ~ 18:00  ' })).toBe('06:00 ~ 18:00');
  });

  it('open/close 둘 다 있으면 "open ~ close"', () => {
    expect(normalizeHours({ ...base, openTime: '20260603 06:00', closeTime: '20260603 18:00' }))
      .toBe('06:00 ~ 18:00');
  });

  it('open만 있고 close 없으면 선거법 fallback', () => {
    expect(normalizeHours({ ...base, openTime: '06:00' })).toBe('06:00 ~ 18:00');
  });

  it('아무것도 없으면 선거법 fallback', () => {
    expect(normalizeHours(base)).toBe('06:00 ~ 18:00');
  });
});

describe('normalizeStation', () => {
  const base: RawPollingStationItem = {
    pollPlaceId: 'P1',
    pollPlaceName: '강남구민회관',
    placeAddr: '서울 강남구 ...',
    xcoord: '127.047',
    ycoord: '37.517',
    votingTime: '06:00 ~ 18:00',
    preVoteYn: 'N',
  };

  it('필드를 도메인 모델로 매핑', () => {
    expect(normalizeStation(base, 0)).toEqual({
      id: 'P1',
      name: '강남구민회관',
      address: '서울 강남구 ...',
      lat: 37.517,
      lng: 127.047,
      hours: '06:00 ~ 18:00',
      isEarlyVoting: false,
    });
  });

  it('pollPlaceId 없으면 index를 id로 사용', () => {
    const { pollPlaceId, ...noId } = base;
    void pollPlaceId;
    expect(normalizeStation(noId, 5).id).toBe('5');
  });

  it('좌표 없으면 0으로 fallback', () => {
    const { xcoord, ycoord, ...noCoord } = base;
    void xcoord; void ycoord;
    const r = normalizeStation(noCoord, 0);
    expect(r.lat).toBe(0);
    expect(r.lng).toBe(0);
  });

  it('preVoteYn === "Y"면 사전투표소', () => {
    expect(normalizeStation({ ...base, preVoteYn: 'Y' }, 0).isEarlyVoting).toBe(true);
  });
});
