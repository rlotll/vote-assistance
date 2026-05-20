// API 응답 정규화 타입 — api_contract.md §2.4

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  retryable: boolean;  // true이면 T-05 토스트에서 재시도 버튼 노출
}

// api_contract.md §5 에러 코드 표
export type ApiErrorCode =
  | 'UPSTREAM_TIMEOUT'
  | 'UPSTREAM_5XX'
  | 'UPSTREAM_INVALID_PARAM'
  | 'UPSTREAM_AUTH'
  | 'MISSING_API_KEY'
  | 'RATE_LIMIT'
  | 'EMPTY_RESULT';

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };
