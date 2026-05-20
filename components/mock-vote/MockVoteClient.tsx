'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useUserStore } from '@/stores/userStore';
import { useElection } from '@/hooks/useElection';
import { useCandidates } from '@/hooks/useCandidates';
import { usePartyPledges } from '@/hooks/usePartyPledges';
import { useMockVoteStore } from '@/stores/mockVoteStore';
import { buildSteps } from '@/lib/mock-vote/steps';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { StepProgress } from './StepProgress';
import { BallotPaper } from './BallotPaper';
import { MockVoteResult } from './MockVoteResult';

export function MockVoteClient() {
  const district = useUserStore((s) => s.district);
  const { election, isLoading: electionLoading } = useElection();

  const sgId = election?.id ?? null;
  const sgTypecode = election?.sgTypecode ?? null;

  const { candidates } = useCandidates(sgId, sgTypecode, district);
  const { partyGroups } = usePartyPledges(sgId, sgTypecode);
  const parties = partyGroups.map((g) => g.party);

  const { selections, setSelection, reset } = useMockVoteStore();
  const [current, setCurrent] = useState(0);
  const [done, setDone] = useState(false);

  if (electionLoading) {
    return (
      <div aria-busy="true" className="flex flex-col gap-3">
        <Skeleton preset="list-item" count={3} />
      </div>
    );
  }

  if (!election) {
    return (
      <p className="text-[length:var(--font-size-body)] text-text-secondary text-center py-8">
        선거 정보를 불러올 수 없어요
      </p>
    );
  }

  const steps = buildSteps(election);

  if (done) {
    return (
      <MockVoteResult
        steps={steps}
        selections={selections}
        candidates={candidates}
        partyGroups={partyGroups}
        election={election}
        onRetry={() => {
          reset();
          setCurrent(0);
          setDone(false);
        }}
      />
    );
  }

  const step = steps[current];
  const selection = selections.find((s) => s.step === step.step);
  const selectedId = step.kind === 'candidate' ? selection?.candidateId : selection?.partyId;
  const canProceed = !!selectedId;
  const isLast = current === steps.length - 1;
  const comparePath = step.kind === 'candidate' ? '/compare/candidates' : '/compare/parties';

  function handleSelect(id: string) {
    if (step.kind === 'candidate') {
      setSelection({ step: step.step, position: step.position, candidateId: id });
    } else {
      setSelection({ step: step.step, partyId: id });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <StepProgress total={steps.length} current={current} />

      <p className="text-[0.875rem] text-text-secondary">
        <span className="text-text-primary font-medium">
          {current + 1} / {steps.length}
        </span>{' '}
        · {step.label}
      </p>

      <BallotPaper
        step={step}
        candidates={candidates}
        parties={parties}
        selectedId={selectedId}
        onSelect={handleSelect}
      />

      <Link
        href={comparePath}
        className="flex items-center justify-between px-3 py-2.5 rounded-card bg-brand-light text-[0.875rem] text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]"
      >
        이 선거의 공약 비교 보기
        <ChevronRight className="w-4 h-4 text-text-secondary" aria-hidden="true" />
      </Link>

      <div className="flex gap-2">
        <Button
          variant="outline"
          fullWidth
          disabled={current === 0}
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
        >
          이전
        </Button>
        <Button
          variant="primary"
          fullWidth
          disabled={!canProceed}
          onClick={() => (isLast ? setDone(true) : setCurrent((c) => c + 1))}
        >
          {isLast ? '결과 보기' : '다음 투표용지'}
        </Button>
      </div>

      <p className="text-[0.75rem] text-text-secondary text-center">결과는 저장되지 않아요</p>
    </div>
  );
}
