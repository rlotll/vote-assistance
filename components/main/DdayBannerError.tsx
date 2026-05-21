'use client';

import { AlertCircle, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

type DdayBannerErrorProps = {
  onRetry: () => void;
};

// D-day 배너 오류 상태 — 로딩 placeholder가 빈 영역으로 사라지지 않도록 재시도 가능한 배너로 전환한다.
// 성공 배너(brand-strong)·안내(info)와 구분되도록 default 카드 스타일 사용.
export function DdayBannerError({ onRetry }: DdayBannerErrorProps) {
  return (
    <section
      role="alert"
      aria-label="선거 정보 오류"
      className="rounded-card border-card border-border-default bg-background-primary p-6 flex flex-col gap-3"
    >
      <div className="flex items-center gap-2 text-text-primary">
        <AlertCircle className="w-5 h-5 text-text-secondary" aria-hidden="true" />
        <h2 className="text-[length:var(--font-size-body)] font-medium">
          선거 정보를 불러오지 못했어요
        </h2>
      </div>
      <p className="text-[length:var(--font-size-caption)] text-text-secondary">
        잠시 후 다시 시도해 주세요.
      </p>
      <Button variant="primary" size="md" leftIcon={RotateCw} onClick={onRetry} className="self-start">
        다시 시도
      </Button>
    </section>
  );
}
