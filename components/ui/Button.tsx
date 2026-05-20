'use client';

import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2, type LucideIcon } from 'lucide-react';

type ButtonProps = {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'md' | 'lg';
  loading?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  fullWidth?: boolean;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>;

const variantClasses = {
  primary: 'bg-brand text-white hover:opacity-90',
  outline: 'border border-brand text-brand bg-transparent hover:bg-brand-light',
  ghost: 'text-brand bg-transparent hover:bg-brand-light',
};

const sizeClasses = {
  md: 'min-h-touch-min px-4 text-[0.9375rem]',
  lg: 'min-h-[3rem] px-6 text-[1rem]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  fullWidth = false,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...rest}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      aria-disabled={isDisabled || undefined}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-button font-medium transition-opacity',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        isDisabled ? 'opacity-40 cursor-not-allowed' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
      ) : (
        LeftIcon && <LeftIcon className="w-4 h-4" aria-hidden="true" />
      )}
      {children}
      {RightIcon && !loading && (
        <RightIcon className="w-4 h-4" aria-hidden="true" />
      )}
    </button>
  );
}
