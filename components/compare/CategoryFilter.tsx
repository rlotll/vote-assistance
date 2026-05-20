'use client';

import { useUserStore } from '@/stores/userStore';
import { PLEDGE_CATEGORIES } from '@/lib/pledge-category';

// 관심 분야 다중 선택 필터 (F-11) — 선택 상태는 userStore에 영속
export function CategoryFilter() {
  const selected = useUserStore((s) => s.selectedCategories);
  const toggleCategory = useUserStore((s) => s.toggleCategory);

  return (
    <div role="group" aria-label="관심 분야 필터" className="flex flex-wrap gap-2">
      {PLEDGE_CATEGORIES.map(({ value, label }) => {
        const isSelected = selected.includes(value);
        return (
          <button
            key={value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => toggleCategory(value)}
            className={[
              'inline-flex items-center min-h-touch-min px-3 rounded-pill text-[0.875rem] font-medium transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]',
              isSelected
                ? 'bg-brand-strong text-white'
                : 'bg-background-secondary text-text-secondary hover:text-brand',
            ].join(' ')}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
