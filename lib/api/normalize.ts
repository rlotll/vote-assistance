// 공공데이터포털 resultCode → ApiResult 정규화 — api_contract.md §2.4, §5
import type { ApiResult, ApiError } from '@/types/api';

// 공공데이터포털 표준 응답 구조 (raw)
interface NecResponseHeader {
  resultCode: string;
  resultMsg: string;
}

interface NecResponse<T> {
  response: {
    header: NecResponseHeader;
    body?: {
      items?: { item?: T | T[] };
      totalCount?: number;
      numOfRows?: number;
      pageNo?: number;
    };
  };
}

export function normalizeNecResponse<T>(raw: NecResponse<T>): ApiResult<T[]> {
  const { resultCode, resultMsg } = raw.response.header;

  if (resultCode === '00' || resultCode === 'INFO-00') {
    const item = raw.response.body?.items?.item;
    const data = item == null ? [] : Array.isArray(item) ? item : [item];
    return { ok: true, data };
  }

  // 데이터 없음(NODATA) — 정상 케이스로 빈 배열 반환 (api_contract §2.6)
  // NEC는 'INFO-03'을 사용. '03'은 표준 공공데이터포털 호환 처리.
  if (resultCode === '03' || resultCode === 'INFO-03') {
    return { ok: true, data: [] };
  }

  return { ok: false, error: buildError(resultCode, resultMsg) };
}

function buildError(resultCode: string, resultMsg: string): ApiError {
  const code = parseInt(resultCode, 10);

  if (resultCode === '04' || resultCode === '05') {
    return { code: 'UPSTREAM_TIMEOUT', message: resultMsg, retryable: true };
  }
  if (code >= 10 && code <= 11) {
    return { code: 'UPSTREAM_INVALID_PARAM', message: resultMsg, retryable: false };
  }
  // 22(일일 한도)는 12~32 범위보다 먼저 체크 — 순서 역전 시 UPSTREAM_AUTH로 덮임
  if (resultCode === '22') {
    return { code: 'RATE_LIMIT', message: '일일 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.', retryable: false };
  }
  if (code >= 12 && code <= 32) {
    return { code: 'UPSTREAM_AUTH', message: resultMsg, retryable: false };
  }

  return { code: 'UPSTREAM_5XX', message: resultMsg, retryable: true };
}
