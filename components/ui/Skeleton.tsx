// 사용 시: 부모 컨테이너에 aria-busy="true" 추가 권장 (스크린리더 로딩 상태 전달)
type SkeletonProps = {
  preset?: 'list-item';
  count?: number;
  className?: string;
};

function SingleSkeleton({ preset = 'list-item', className = '' }: Omit<SkeletonProps, 'count'>) {
  if (preset === 'list-item') {
    return (
      <div
        aria-hidden="true"
        className={[
          'rounded-card bg-background-secondary motion-safe:animate-pulse',
          'h-[4.5rem] w-full',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      />
    );
  }

  return null;
}

export function Skeleton({ preset = 'list-item', count = 1, className }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <SingleSkeleton key={i} preset={preset} className={className} />
      ))}
    </>
  );
}
