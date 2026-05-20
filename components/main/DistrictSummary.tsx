'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, ChevronRight } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { Card } from '@/components/ui/Card';

// 홈 화면의 내 선거구 요약 — 현재 선거구를 보여주고 언제든 /district에서 다시 선택
export function DistrictSummary() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useUserStore.persist.onFinishHydration(() => setHydrated(true));
    useUserStore.persist.rehydrate();
    return unsub;
  }, []);

  const district = useUserStore((s) => s.district);

  // 하이드레이션 전에는 자리만 차지(레이아웃 흔들림 방지)
  if (!hydrated) {
    return <div className="h-[4.5rem]" aria-hidden="true" />;
  }

  const isSet = !!district;

  return (
    <Link
      href="/district"
      aria-label={isSet ? '내 선거구 변경' : '내 선거구 설정'}
      className="block rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] transition-colors motion-reduce:transition-none"
    >
      <Card variant={isSet ? 'default' : 'info'} className="hover:opacity-90 active:scale-[0.98]">
        <div className="flex items-center justify-between min-h-touch-min gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="w-5 h-5 text-brand shrink-0" aria-hidden="true" />
            <div className="flex flex-col min-w-0">
              <span className="text-[length:var(--font-size-label)] text-text-secondary">내 선거구</span>
              <span className="text-[length:var(--font-size-body)] text-text-primary font-medium truncate">
                {isSet ? `${district.sido.name} ${district.sigungu.name}` : '선거구를 설정해주세요'}
              </span>
            </div>
          </div>
          <span className="flex items-center gap-0.5 shrink-0 text-[0.8125rem] text-brand-strong font-medium">
            {isSet ? '변경' : '설정'}
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </span>
        </div>
      </Card>
    </Link>
  );
}
