'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MapPin, Scale, CheckSquare } from 'lucide-react';

const tabs = [
  {
    label: '홈',
    href: '/',
    icon: Home,
    isActive: (p: string) => p === '/',
  },
  {
    label: '투표소',
    href: '/polling-stations',
    icon: MapPin,
    isActive: (p: string) => p === '/district' || p.startsWith('/polling-stations'),
  },
  {
    label: '공약비교',
    href: '/compare/candidates',
    icon: Scale,
    isActive: (p: string) => p.startsWith('/compare'),
  },
  {
    label: '모의투표',
    href: '/mock-vote',
    icon: CheckSquare,
    isActive: (p: string) => p.startsWith('/mock-vote'),
  },
] as const;

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="주요 메뉴"
      className="fixed bottom-0 left-0 right-0 z-10 bg-background-primary border-t border-border-default"
      style={{ paddingBottom: 'var(--safe-area-bottom)' }}
    >
      <ul className="flex h-[var(--bottom-tab-height)]">
        {tabs.map(({ label, href, icon: Icon, isActive }) => {
          const active = isActive(pathname);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={[
                  'flex flex-col items-center justify-center gap-1 w-full h-full min-h-touch-min',
                  'text-[0.75rem] font-medium transition-colors',
                  'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-focus-ring)]',
                  active ? 'text-brand-strong' : 'text-text-secondary',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <Icon className="w-5 h-5" aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
