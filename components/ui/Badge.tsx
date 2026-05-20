import { type ReactNode } from 'react';
import { type LucideIcon } from 'lucide-react';

type BadgeProps = {
  variant?: 'default' | 'early-voting' | 'd-day';
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
};

const variantClasses = {
  default: 'bg-brand-light text-text-primary',
  'early-voting': 'bg-early-voting-bg text-early-voting-fg',
  'd-day': 'bg-brand text-white text-[1rem] font-medium',
};

export function Badge({
  variant = 'default',
  icon: Icon,
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-pill px-2 py-0.5 text-[0.75rem]',
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {Icon && <Icon className="w-3 h-3" aria-hidden="true" />}
      {children}
    </span>
  );
}
