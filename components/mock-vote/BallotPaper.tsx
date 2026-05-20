'use client';

import { Card } from '@/components/ui/Card';
import type { Candidate, Party } from '@/types/domain';
import type { MockVoteStep } from '@/lib/mock-vote/steps';

type Props = {
  step: MockVoteStep;
  candidates: Candidate[];
  parties: Party[];
  selectedId?: string;
  onSelect: (id: string) => void;
};

// 실제 투표용지 형태의 단일 선택 라디오 목록 (F-16, F-17)
export function BallotPaper({ step, candidates, parties, selectedId, onSelect }: Props) {
  const isCandidate = step.kind === 'candidate';
  const variant = isCandidate ? 'ballot-green' : 'ballot-blue';

  // 기호 순서는 route 정렬을 그대로 사용 (NF-05)
  const rows = isCandidate
    ? candidates.map((c) => ({ id: c.id, number: c.number, name: c.name, sub: c.partyName }))
    : parties.map((p) => ({ id: p.id, number: p.number, name: p.name, sub: '' }));

  if (rows.length === 0) {
    return (
      <Card variant={variant}>
        <p className="text-[0.875rem] text-text-secondary text-center py-4">
          {isCandidate ? '후보자 정보가 없어요' : '정당 정보가 없어요'}
        </p>
      </Card>
    );
  }

  return (
    <Card variant={variant} padding="sm">
      <ul role="radiogroup" aria-label={`${step.label} 투표용지`} className="flex flex-col gap-2 list-none p-0 m-0">
        {rows.map((row) => {
          const checked = row.id === selectedId;
          return (
            <li key={row.id}>
              <button
                type="button"
                role="radio"
                aria-checked={checked}
                onClick={() => onSelect(row.id)}
                className={[
                  'w-full min-h-touch-min flex items-center gap-3 px-3 py-2 rounded-button bg-background-primary text-left transition-colors',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]',
                  checked ? 'ring-2 ring-brand' : 'hover:bg-background-secondary',
                ].join(' ')}
              >
                <span className="w-7 h-7 shrink-0 rounded-full bg-background-secondary text-text-primary text-[0.875rem] font-medium flex items-center justify-center">
                  {row.number}
                </span>
                <span className="flex flex-col min-w-0">
                  <span className="text-[0.9375rem] font-medium text-text-primary truncate">{row.name}</span>
                  {row.sub && <span className="text-[0.8125rem] text-text-secondary truncate">{row.sub}</span>}
                </span>
                <span
                  className={[
                    'ml-auto w-5 h-5 shrink-0 rounded-full border-2',
                    checked ? 'border-brand bg-brand' : 'border-border-default',
                  ].join(' ')}
                  aria-hidden="true"
                />
              </button>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
