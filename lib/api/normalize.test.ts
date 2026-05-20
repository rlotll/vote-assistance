import { describe, it, expect } from 'vitest';
import { normalizeNecResponse } from './normalize';

// 표준 NEC 응답 빌더
function res<T>(resultCode: string, item?: T | T[]) {
  return {
    response: {
      header: { resultCode, resultMsg: 'msg' },
      body: item === undefined ? undefined : { items: { item } },
    },
  };
}

describe('normalizeNecResponse — 성공', () => {
  it('단일 item을 배열로 감싼다', () => {
    const r = normalizeNecResponse(res('00', { name: 'A' }));
    expect(r).toEqual({ ok: true, data: [{ name: 'A' }] });
  });

  it('배열 item은 그대로 둔다', () => {
    const r = normalizeNecResponse(res('00', [{ name: 'A' }, { name: 'B' }]));
    expect(r.ok && r.data).toHaveLength(2);
  });

  it('INFO-00도 성공으로 처리한다', () => {
    const r = normalizeNecResponse(res('INFO-00', { name: 'A' }));
    expect(r.ok).toBe(true);
  });

  it('item 없으면 빈 배열', () => {
    const r = normalizeNecResponse(res('00'));
    expect(r).toEqual({ ok: true, data: [] });
  });
});

describe('normalizeNecResponse — NODATA', () => {
  it('03/INFO-03은 빈 배열 성공', () => {
    expect(normalizeNecResponse(res('03'))).toEqual({ ok: true, data: [] });
    expect(normalizeNecResponse(res('INFO-03'))).toEqual({ ok: true, data: [] });
  });
});

describe('normalizeNecResponse — 에러 코드 분기', () => {
  it('04/05는 타임아웃(재시도 가능)', () => {
    const r = normalizeNecResponse(res('04'));
    expect(r.ok).toBe(false);
    expect(!r.ok && r.error).toMatchObject({ code: 'UPSTREAM_TIMEOUT', retryable: true });
  });

  it('10~11은 잘못된 파라미터(재시도 불가)', () => {
    const r = normalizeNecResponse(res('10'));
    expect(!r.ok && r.error).toMatchObject({ code: 'UPSTREAM_INVALID_PARAM', retryable: false });
  });

  it('22는 RATE_LIMIT — 12~32 범위보다 먼저 매칭되어야 한다', () => {
    const r = normalizeNecResponse(res('22'));
    expect(!r.ok && r.error?.code).toBe('RATE_LIMIT');
  });

  it('12~32(22 제외)는 인증 오류', () => {
    const r = normalizeNecResponse(res('30'));
    expect(!r.ok && r.error?.code).toBe('UPSTREAM_AUTH');
  });

  it('그 외 코드는 5XX(재시도 가능)', () => {
    const r = normalizeNecResponse(res('99'));
    expect(!r.ok && r.error).toMatchObject({ code: 'UPSTREAM_5XX', retryable: true });
  });
});
