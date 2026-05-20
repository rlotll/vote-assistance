'use client';

// selector 분리: 액션 구독 컴포넌트가 toasts 변경에 불필요하게 리렌더되지 않도록
import { useToastStore } from '@/stores/toastStore';
import type { Toast } from '@/stores/toastStore';

export type { Toast };

// <Toaster> 컴포넌트용 — 토스트 목록만 구독
export function useToasts() {
  return useToastStore((s) => s.toasts);
}

// 토스트 발행/제거 액션만 필요한 컴포넌트용
export function useToast() {
  const toast = useToastStore((s) => s.add);
  const dismiss = useToastStore((s) => s.dismiss);
  const dismissAll = useToastStore((s) => s.dismissAll);
  return { toast, dismiss, dismissAll };
}
