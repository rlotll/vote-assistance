'use client';

import { useRef, type KeyboardEvent } from 'react';

type TabItem = {
  value: string;
  label: string;
  disabled?: boolean;
};

type TabsProps = {
  value: string;
  onChange: (next: string) => void;
  items: TabItem[];
  ariaLabel: string;
  className?: string;
};

export function Tabs({ value, onChange, items, ariaLabel, className = '' }: TabsProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const enabledIndices = items
      .map((item, i) => (!item.disabled ? i : -1))
      .filter((i) => i !== -1);

    const currentPos = enabledIndices.indexOf(index);

    let nextIndex: number | undefined;

    if (e.key === 'ArrowRight') {
      nextIndex = enabledIndices[(currentPos + 1) % enabledIndices.length];
    } else if (e.key === 'ArrowLeft') {
      nextIndex =
        enabledIndices[(currentPos - 1 + enabledIndices.length) % enabledIndices.length];
    } else if (e.key === 'Home') {
      nextIndex = enabledIndices[0];
    } else if (e.key === 'End') {
      nextIndex = enabledIndices[enabledIndices.length - 1];
    }

    if (nextIndex !== undefined) {
      e.preventDefault();
      tabRefs.current[nextIndex]?.focus();
      onChange(items[nextIndex].value);
    }
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={['flex border-b border-border-default', className].filter(Boolean).join(' ')}
    >
      {items.map((item, index) => {
        const isActive = item.value === value;
        const isDisabled = item.disabled ?? false;

        return (
          <button
            key={item.value}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            role="tab"
            aria-selected={isActive}
            aria-disabled={isDisabled || undefined}
            tabIndex={isActive ? 0 : -1}
            disabled={isDisabled}
            onClick={() => {
              if (!isDisabled) onChange(item.value);
            }}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={[
              'min-h-touch-min px-4 text-[0.9375rem] font-medium transition-colors',
              'focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-focus-ring)]',
              isActive
                ? 'text-brand-strong border-b-2 border-brand'
                : 'text-text-secondary border-b-2 border-transparent',
              isDisabled ? 'opacity-40 cursor-not-allowed' : 'hover:text-brand',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
