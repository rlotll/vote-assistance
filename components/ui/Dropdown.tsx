'use client';

type DropdownOption<T extends string> = {
  value: T;
  label: string;
};

type DropdownProps<T extends string> = {
  value: T | null;
  onChange: (next: T) => void;
  options: DropdownOption<T>[];
  placeholder: string;
  disabled?: boolean;
  loading?: boolean;
  ariaLabel: string;
  className?: string;
};

export function Dropdown<T extends string>({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  loading = false,
  ariaLabel,
  className = '',
}: DropdownProps<T>) {
  const isDisabled = disabled || loading;

  return (
    <select
      aria-label={ariaLabel}
      disabled={isDisabled}
      value={value ?? ''}
      onChange={(e) => {
        if (e.target.value) onChange(e.target.value as T);
      }}
      className={[
        'w-full min-h-touch-min px-3 rounded-button border-card border-border-default',
        'bg-background-primary text-text-primary text-[0.9375rem]',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]',
        isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <option value="" disabled>
        {loading ? '불러오는 중...' : placeholder}
      </option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
