import { type ElementType, type ReactNode } from 'react';

type CardProps = {
  variant?: 'default' | 'info' | 'ballot-green' | 'ballot-peach' | 'ballot-blue';
  padding?: 'sm' | 'md';
  as?: ElementType;
  children: ReactNode;
  className?: string;
};

const variantClasses = {
  default: 'bg-background-primary border-card border-border-default',
  // 와이어프레임 §4 "안내 박스" 용도 — border 없는 배경 강조 박스
  info: 'bg-brand-light',
  // 모의투표 투표용지 배경 — border 없는 색상 구분 전용
  'ballot-green': 'bg-ballot-green',
  'ballot-peach': 'bg-ballot-peach',
  'ballot-blue': 'bg-ballot-blue',
};

const paddingClasses = {
  sm: 'p-3',
  md: 'p-4',
};

export function Card({
  variant = 'default',
  padding = 'md',
  as: Tag = 'div',
  children,
  className = '',
}: CardProps) {
  return (
    <Tag
      className={[
        'rounded-card',
        variantClasses[variant],
        paddingClasses[padding],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </Tag>
  );
}
