// 공약 분야 라벨/순서 단일 정의 — S-04/S-05 필터가 공통 import (domain_model §5)
import type { PledgeCategory } from '@/types/domain';

export const PLEDGE_CATEGORIES: { value: PledgeCategory; label: string }[] = [
  { value: 'economy', label: '경제' },
  { value: 'housing', label: '주거' },
  { value: 'environment', label: '환경' },
  { value: 'education', label: '교육' },
  { value: 'welfare', label: '복지' },
];

const LABEL_MAP: Record<PledgeCategory, string> = Object.fromEntries(
  PLEDGE_CATEGORIES.map((c) => [c.value, c.label]),
) as Record<PledgeCategory, string>;

export function categoryLabel(category: PledgeCategory): string {
  return LABEL_MAP[category];
}
