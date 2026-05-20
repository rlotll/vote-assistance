import { User, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Candidate, Pledge, PledgeCategory } from '@/types/domain';

type Props = {
  candidate: Candidate;
  pledges: Pledge[];
  isLoading: boolean;
  selectedCategories: PledgeCategory[];
};

// 후보 1인 카드 — 와이어프레임 S-04: 아바타 + 기호 + 소속 정당 + 공약 줄 + 원문 보기 링크
export function CandidateCard({ candidate, pledges, isLoading, selectedCategories }: Props) {
  const filtered =
    selectedCategories.length === 0
      ? pledges
      : pledges.filter((p) => selectedCategories.includes(p.category));

  return (
    <li className="shrink-0 w-64 list-none">
      <Card variant="default" className="h-full">
        <div className="flex flex-col gap-3">
          {/* 헤더: 아바타 + 기호 + 이름 + 정당 */}
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              {candidate.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={candidate.photoUrl}
                  alt={`${candidate.name} 후보`}
                  className="w-12 h-12 rounded-full object-cover bg-background-secondary"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-background-secondary flex items-center justify-center">
                  <User className="w-6 h-6 text-text-secondary" aria-hidden="true" />
                </div>
              )}
              <span
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-brand text-white text-[0.75rem] font-medium flex items-center justify-center"
                aria-label={`기호 ${candidate.number}번`}
              >
                {candidate.number}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[0.9375rem] font-medium text-text-primary truncate">
                {candidate.name}
              </p>
              <p className="text-[0.8125rem] text-text-secondary truncate">{candidate.partyName}</p>
            </div>
          </div>

          {/* 공약 목록 */}
          {isLoading ? (
            <div aria-busy="true" className="flex flex-col gap-2">
              <Skeleton preset="list-item" count={2} />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-[0.8125rem] text-text-secondary py-2">
              {selectedCategories.length > 0 ? '선택한 분야의 공약이 없어요' : '등록된 공약이 없어요'}
            </p>
          ) : (
            <ul className="flex flex-col gap-2.5 list-none p-0 m-0">
              {filtered.map((pledge) => (
                <li key={pledge.id} className="flex flex-col gap-1">
                  <p className="text-[0.875rem] text-text-primary leading-snug">{pledge.title}</p>
                  {pledge.sourceUrl && (
                    <a
                      href={pledge.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[0.75rem] text-brand hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]"
                    >
                      <ExternalLink className="w-3 h-3" aria-hidden="true" />
                      원문 보기
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </li>
  );
}
