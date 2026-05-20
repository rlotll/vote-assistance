// 공공데이터포털 외부 API 호출 헬퍼 — 서버 전용 (NEC_API_KEY 보호)
// 이 파일은 Route Handler에서만 import — 클라이언트 번들 포함 금지
import 'server-only';

import { normalizeNecResponse } from './normalize';
import type { ApiResult } from '@/types/api';

const BASE_URL = 'http://apis.data.go.kr/9760000';

function getApiKey(): string {
  const key = process.env.NEC_API_KEY;
  if (!key) {
    throw new Error('MISSING_API_KEY');
  }
  return key;
}

interface NecFetchOptions {
  service: string;
  operation: string;
  params?: Record<string, string | number>;
}

export async function fetchNec<T>(options: NecFetchOptions): Promise<ApiResult<T[]>> {
  const { service, operation, params = {} } = options;

  const searchParams = new URLSearchParams({
    serviceKey: getApiKey(),
    resultType: 'json',
    pageNo: '1',
    numOfRows: '100',
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  });

  const url = `${BASE_URL}/${service}/${operation}?${searchParams.toString()}`;

  let raw: unknown;
  try {
    const res = await fetch(url, {
      // Route Handler 자체 캐싱은 각 handler의 revalidate로 제어
      cache: 'no-store',
    });

    if (!res.ok) {
      return {
        ok: false,
        error: { code: 'UPSTREAM_5XX', message: `HTTP ${res.status}`, retryable: true },
      };
    }

    raw = await res.json();
  } catch {
    return {
      ok: false,
      error: { code: 'UPSTREAM_TIMEOUT', message: '외부 API 응답 시간 초과', retryable: true },
    };
  }

  return normalizeNecResponse(raw as Parameters<typeof normalizeNecResponse>[0]) as ApiResult<T[]>;
}
