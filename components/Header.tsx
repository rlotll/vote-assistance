'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

// title 전달 시 이 컴포넌트가 h1을 렌더링하므로 page 내부 h1 제거 필요.
// title 미전달 시 h1이 렌더링되지 않으므로 page에서 h1을 직접 렌더링해야 함.
type HeaderProps = {
  title?: string;
  showBack?: boolean;
};

export function Header({ title, showBack = false }: HeaderProps) {
  const router = useRouter();

  return (
    <header className="flex items-center h-14 px-4 bg-background-primary border-b border-border-default">
      {showBack && (
        <button
          onClick={() => router.back()}
          aria-label="뒤로가기"
          className={[
            'flex items-center justify-center w-[2.75rem] h-[2.75rem] -ml-2 rounded-button',
            'text-text-primary transition-colors hover:bg-background-secondary',
            'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)]',
          ].join(' ')}
        >
          <ChevronLeft className="w-5 h-5" aria-hidden="true" />
        </button>
      )}
      {title && (
        <h1
          className={[
            'text-[1.125rem] font-medium text-text-primary',
            showBack ? 'ml-1' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {title}
        </h1>
      )}
    </header>
  );
}
