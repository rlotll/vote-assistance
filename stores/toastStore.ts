// 토스트 UI 상태 — persist 없음 (in-memory only, 새로고침 시 초기화)
import { create } from 'zustand';

export interface Toast {
  id: string;
  variant: 'error' | 'info';
  message: string;
  action?: { label: string; onClick: () => void };
  durationMs?: number;  // undefined = 무한 (에러용)
}

const MAX_TOASTS = 3;

interface ToastStore {
  toasts: Toast[];
  add: (toast: Omit<Toast, 'id'>) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

// 타이머 id를 store 외부 Map에 보관 — Zustand 직렬화 대상에서 제외
const timers = new Map<string, ReturnType<typeof setTimeout>>();

let counter = 0;

export const useToastStore = create<ToastStore>()((set, get) => ({
  toasts: [],

  add: (options) => {
    const id = `toast-${++counter}`;

    set((state) => {
      const next = [...state.toasts];
      // 최대 3개 초과 시 가장 오래된 것 제거
      if (next.length >= MAX_TOASTS) {
        const oldest = next.shift()!;
        const oldTimer = timers.get(oldest.id);
        if (oldTimer !== undefined) {
          clearTimeout(oldTimer);
          timers.delete(oldest.id);
        }
      }
      next.push({ ...options, id });
      return { toasts: next };
    });

    // 자동 dismiss 타이머 — store 레벨에서 관리 (컴포넌트 트리와 무관)
    if (options.durationMs !== undefined) {
      const timer = setTimeout(() => {
        get().dismiss(id);
      }, options.durationMs);
      timers.set(id, timer);
    }

    return id;
  },

  dismiss: (id) => {
    const timer = timers.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      timers.delete(id);
    }
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  dismissAll: () => {
    timers.forEach((timer) => clearTimeout(timer));
    timers.clear();
    set({ toasts: [] });
  },
}));
