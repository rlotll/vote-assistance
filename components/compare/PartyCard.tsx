import { ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import type { Party, Pledge, PledgeCategory } from '@/types/domain';

type Props = {
  party: Party;
  pledges: Pledge[];
  selectedCategories: PledgeCategory[];
};

// 정당 1개 카드 — 와이어프레임 S-05: 정당 아이콘(색상) + 기호 + 정당명 + 정책 줄 + 원문 보기 링크
export function PartyCard({ party, pledges, selectedCategories }: Props) {
  const filtered =
    selectedCategories.length === 0
      ? pledges
      : pledges.filter((p) => selectedCategories.includes(p.category));

  return (
    <li className="shrink-0 w-64 list-none">
      <Card variant="default" className="h-full">
        <div className="flex flex-col gap-3">
          {/* 헤더: 색상 아이콘 + 기호 + 정당명 */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-white text-[0.875rem] font-medium"
              style={{ backgroundColor: party.brandColor }}
              aria-label={`기호 ${party.number}번`}
            >
              {party.number}
            </div>
            <p className="text-[0.9375rem] font-medium text-text-primary truncate">{party.name}</p>
          </div>

          {/* 정책 목록 */}
          {filtered.length === 0 ? (
            <p className="text-[0.8125rem] text-text-secondary py-2">
              {selectedCategories.length > 0 ? '선택한 분야의 정책이 없어요' : '등록된 정책이 없어요'}
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
