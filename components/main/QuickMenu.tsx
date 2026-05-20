'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { Card } from '@/components/ui/Card';

const MENU_ITEMS = [
  { label: '공약 비교', href: '/compare/candidates' },
  { label: '모의투표', href: '/mock-vote' },
] as const;

export function QuickMenu() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const unsub = useUserStore.persist.onFinishHydration(() => setHydrated(true));
    useUserStore.persist.rehydrate();
    return unsub;
  }, []);

  const district = useUserStore((s) => s.district);
  const pollingHref = hydrated && district ? '/polling-stations' : '/district';

  return (
    <nav aria-label="빠른 메뉴">
      <ul role="list" className="flex flex-col gap-3 list-none p-0 m-0">
        <li>
          <Link
            href={pollingHref}
            className="block rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] transition-colors motion-reduce:transition-none"
          >
            <Card variant="default" className="hover:bg-background-secondary active:scale-[0.98]">
              <div className="flex items-center justify-between min-h-touch-min">
                <span className="text-[length:var(--font-size-body)] text-text-primary font-medium">
                  내 투표소
                </span>
                <ChevronRight className="w-5 h-5 text-text-secondary shrink-0" aria-hidden="true" />
              </div>
            </Card>
          </Link>
        </li>
        {MENU_ITEMS.map(({ label, href }) => (
          <li key={href}>
            <Link
              href={href}
              className="block rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)] transition-colors motion-reduce:transition-none"
            >
              <Card variant="default" className="hover:bg-background-secondary active:scale-[0.98]">
                <div className="flex items-center justify-between min-h-touch-min">
                  <span className="text-[length:var(--font-size-body)] text-text-primary font-medium">
                    {label}
                  </span>
                  <ChevronRight className="w-5 h-5 text-text-secondary shrink-0" aria-hidden="true" />
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
