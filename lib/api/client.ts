// 클라이언트에서 내부 Route Handler 호출용 fetch 래퍼
import type { ApiResult } from '@/types/api';

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const res = await fetch(path, init);
    const json: ApiResult<T> = await res.json();
    return json;
  } catch {
    return {
      ok: false,
      error: { code: 'UPSTREAM_TIMEOUT', message: '네트워크 오류가 발생했습니다.', retryable: true },
    };
  }
}
