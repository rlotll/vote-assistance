'use client';

import { formatDdayLabel } from '@/lib/elections/d-day';
import type { Election } from '@/types/domain';

type DdayBannerProps = {
  election: Election;
  dday: number;
};

function formatElectionDay(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  return `${y}년 ${m}월 ${d}일`;
}

function ddayAriaLabel(dday: number): string {
  if (dday > 0) return `${dday}일 남음`;
  if (dday === 0) return '선거 당일';
  return `선거 종료 ${Math.abs(dday)}일 경과`;
}

export function DdayBanner({ election, dday }: DdayBannerProps) {
  return (
    <section
      aria-label="선거 D-day 안내"
      className="bg-brand-strong rounded-card p-6 text-white flex flex-col gap-2"
    >
      <h2 className="text-sm font-medium">{election.name}</h2>
      <span
        className="text-5xl font-bold"
        aria-label={ddayAriaLabel(dday)}
      >
        {formatDdayLabel(dday)}
      </span>
      <p className="text-sm">{formatElectionDay(election.electionDay)}</p>
    </section>
  );
}
