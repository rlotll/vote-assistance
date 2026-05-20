import { describe, it, expect } from 'vitest';
import { normalizeStation, type RawPollingStationItem } from './normalize';

describe('normalizeStation', () => {
  const pre: RawPollingStationItem = {
    num: '1',
    evPsName: '청운효자동 사전투표소',
    placeName: '청운효자동주민센터',
    addr: '서울특별시 종로구 자하문로 92',
    emdName: '청운효자동',
    floor: '1층',
  };

  it('사전투표소 필드를 도메인 모델로 매핑 (좌표·시간 미제공 → 고정값, 층은 address와 분리)', () => {
    expect(normalizeStation(pre, 0, true)).toEqual({
      id: 'pre-1',
      name: '청운효자동 사전투표소',
      address: '서울특별시 종로구 자하문로 92',
      floor: '1층',
      lat: 0,
      lng: 0,
      hours: '06:00 ~ 18:00',
      isEarlyVoting: true,
    });
  });

  it('선거일투표소는 psName을 이름으로, prefix는 day', () => {
    const day: RawPollingStationItem = { num: '1', psName: '청운효자동 제1투표소', addr: '서울특별시 종로구 ...' };
    const r = normalizeStation(day, 0, false);
    expect(r.id).toBe('day-1');
    expect(r.name).toBe('청운효자동 제1투표소');
    expect(r.isEarlyVoting).toBe(false);
  });

  it('주소(address)는 층을 포함하지 않으며, floor가 없으면 undefined', () => {
    expect(normalizeStation(pre, 0, true).address).toBe('서울특별시 종로구 자하문로 92');
    const { floor, ...noFloor } = pre;
    void floor;
    expect(normalizeStation(noFloor, 0, true).floor).toBeUndefined();
  });

  it('num 없으면 index를 id로 사용', () => {
    const { num, ...noNum } = pre;
    void num;
    expect(normalizeStation(noNum, 5, true).id).toBe('pre-5');
  });

  it('투표소명 필드가 모두 없으면 placeName으로 fallback', () => {
    const r = normalizeStation({ placeName: '시민회관', addr: '주소' }, 0, false);
    expect(r.name).toBe('시민회관');
  });
});
