'use client';

import { useToasts, useToast } from '@/hooks/useToast';
import { X } from 'lucide-react';

export function Toaster() {
  const toasts = useToasts();
  const { dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-[calc(var(--bottom-tab-height)+var(--safe-area-bottom)+0.5rem)] left-0 right-0 z-50 flex flex-col gap-2 px-4 pointer-events-none"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.variant === 'error' ? 'alert' : 'status'}
          aria-live={t.variant === 'error' ? 'assertive' : 'polite'}
          className={[
            'flex items-center gap-3 rounded-card border-card px-4 py-3 shadow-md pointer-events-auto',
            t.variant === 'error'
              ? 'bg-red-50 text-red-900 border border-red-200'
              : 'bg-background-secondary border-border-default text-text-primary',
          ].join(' ')}
        >
          <p className="flex-1 text-[length:var(--font-size-body)]">{t.message}</p>
          {t.action && (
            <button
              onClick={() => { t.action!.onClick(); dismiss(t.id); }}
              className="shrink-0 text-brand-strong text-[length:var(--font-size-label)] font-medium underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]"
            >
              {t.action.label}
            </button>
          )}
          <button
            onClick={() => dismiss(t.id)}
            aria-label="알림 닫기"
            className="shrink-0 flex items-center justify-center min-h-touch-min min-w-touch-min rounded-full hover:bg-black/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  );
}
