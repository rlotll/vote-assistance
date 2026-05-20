'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Tabs } from '@/components/ui/Tabs';
import { useElection } from '@/hooks/useElection';
import { hasProportionalRepresentation } from '@/types/domain';

// S-04/S-05 공통 탭 — 후보자 ↔ 정당(비례). 정당 탭은 지방선거에서만 활성 (F-13)
export function CompareTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const { election } = useElection();

  const active = pathname.endsWith('/parties') ? 'parties' : 'candidates';
  const partiesEnabled = !!election && hasProportionalRepresentation(election);

  return (
    <Tabs
      value={active}
      onChange={(next) => {
        if (next === active) return;
        router.push(next === 'parties' ? '/compare/parties' : '/compare/candidates');
      }}
      items={[
        { value: 'candidates', label: '후보자' },
        { value: 'parties', label: '정당(비례)', disabled: !partiesEnabled },
      ]}
      ariaLabel="공약 비교 대상 선택"
    />
  );
}
