// ApiError → 토스트 노출 어댑터 — NF-02 재시도 정합
// 각 useQuery 훅의 onError에서 수동 호출 (apiFetch 자동 호출 아님)
import { useToastStore } from '@/stores/toastStore';
import type { ApiError } from '@/types/api';

export function showApiError(error: ApiError, onRetry?: () => void): void {
  // 운영자 알림 케이스 — 사용자에게 노출하지 않음 (api_contract §5)
  if (error.code === 'UPSTREAM_AUTH' || error.code === 'MISSING_API_KEY') {
    console.error('[한표투표] API 인증 오류:', error.code, error.message);
    return;
  }

  const { add } = useToastStore.getState();

  if (error.retryable && onRetry) {
    add({
      variant: 'error',
      message: error.message,
      action: { label: '다시 시도', onClick: onRetry },
      // 재시도 버튼 있는 에러는 무한 유지 — 사용자가 직접 닫거나 재시도
      durationMs: undefined,
    });
    return;
  }

  add({
    variant: 'error',
    message: error.message,
    // onRetry 없는 경우 닫기 버튼(<Toaster> 제공 전) fallback으로 자동 dismiss
    // retryable: 8초(더 긴 확인 시간), non-retryable: 5초
    durationMs: error.retryable ? 8000 : 5000,
  });
}
