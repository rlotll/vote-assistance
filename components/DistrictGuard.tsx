'use client';

// 선거구 미설정 상태에서 보호 라우트(/polling-stations, /compare/*, /mock-vote) 접근 차단
// SSR 하이드레이션 전에는 판정 불가하므로 마운트 후 useEffect에서 처리
// ui-dev가 보호 라우트의 layout.tsx에서 이 컴포넌트로 children을 감싸면 됨
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/stores/userStore';
import { needsDistrictSetup } from '@/lib/guards/require-district';

interface DistrictGuardProps {
  children: React.ReactNode;
}

export function DistrictGuard({ children }: DistrictGuardProps) {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // rehydrate() 완료 후 setHydrated — 완료 전 district 판정으로 인한 false redirect 방지
    const unsub = useUserStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    useUserStore.persist.rehydrate();
    return unsub;
  }, []);

  const district = useUserStore((s) => s.district);

  useEffect(() => {
    if (!hydrated) return;
    if (needsDistrictSetup(district)) {
      router.replace('/district');
    }
  }, [hydrated, district, router]);

  // 하이드레이션 전 또는 리다이렉트 대기 중에는 아무것도 렌더링하지 않음
  if (!hydrated || needsDistrictSetup(district)) {
    return null;
  }

  return <>{children}</>;
}
