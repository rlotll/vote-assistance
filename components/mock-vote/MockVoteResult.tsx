'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useCandidatePledges } from '@/hooks/useCandidatePledges';
import type { Candidate, Election, PartyWithPledges } from '@/types/domain';
import type { MockVoteStep } from '@/lib/mock-vote/steps';
import type { MockVoteSelection } from '@/stores/mockVoteStore';

type Props = {
  steps: MockVoteStep[];
  selections: MockVoteSelection[];
  candidates: Candidate[];
  partyGroups: PartyWithPledges[];
  election: Election;
  onRetry: () => void;
};

// 결과 요약 카드 — 선택한 후보/정당 + 주요 공약 1건 (F-18: 저장/전송 없이 화면 표시만)
function ResultCard({
  step,
  selection,
  candidates,
  partyGroups,
  election,
}: {
  step: MockVoteStep;
  selection?: MockVoteSelection;
  candidates: Candidate[];
  partyGroups: PartyWithPledges[];
  election: Election;
}) {
  const isCandidate = step.kind === 'candidate';
  const candidate = isCandidate
    ? candidates.find((c) => c.id === selection?.candidateId)
    : undefined;
  const partyGroup = !isCandidate
    ? partyGroups.find((g) => g.party.id === selection?.partyId)
    : undefined;

  // candidate 스텝일 때만 공약 조회 (party는 partyGroup.pledges 사용)
  const { pledges } = useCandidatePledges(
    election.id,
    election.sgTypecode,
    isCandidate ? (selection?.candidateId ?? null) : null,
  );

  const name = candidate?.name ?? partyGroup?.party.name ?? '선택 안 함';
  const number = candidate?.number ?? partyGroup?.party.number;
  const sub = candidate?.partyName;
  const topPledge = isCandidate ? pledges[0]?.title : partyGroup?.pledges[0]?.title;

  return (
    <Card variant={isCandidate ? 'ballot-green' : 'ballot-blue'}>
      <div className="flex flex-col gap-1.5">
        <p className="text-[0.75rem] text-text-secondary">{step.label}</p>
        <div className="flex items-center gap-2">
          {number !== undefined && (
            <span className="w-6 h-6 shrink-0 rounded-full bg-background-primary text-text-primary text-[0.8125rem] font-medium flex items-center justify-center">
              {number}
            </span>
          )}
          <span className="text-[0.9375rem] font-medium text-text-primary">{name}</span>
          {sub && <span className="text-[0.8125rem] text-text-secondary">{sub}</span>}
        </div>
        {topPledge && <p className="text-[0.8125rem] text-text-primary leading-snug">“{topPledge}”</p>}
      </div>
    </Card>
  );
}

export function MockVoteResult({ steps, selections, candidates, partyGroups, election, onRetry }: Props) {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col items-center gap-2 py-4">
        <CheckCircle2 className="w-12 h-12 text-brand" aria-hidden="true" />
        <p className="text-[1.125rem] font-medium text-text-primary">모의투표 완료!</p>
      </div>

      <div className="flex flex-col gap-3">
        {steps.map((step) => (
          <ResultCard
            key={step.step}
            step={step}
            selection={selections.find((s) => s.step === step.step)}
            candidates={candidates}
            partyGroups={partyGroups}
            election={election}
          />
        ))}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" fullWidth onClick={onRetry}>
          다시 해보기
        </Button>
        <Button variant="primary" fullWidth onClick={() => router.push('/compare/candidates')}>
          공약 비교로 이동
        </Button>
      </div>

      <p className="text-[0.75rem] text-text-secondary text-center">결과는 저장되지 않아요</p>
    </div>
  );
}
