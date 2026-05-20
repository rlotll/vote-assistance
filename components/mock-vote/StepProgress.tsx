// 진행 스텝바 — 완료(brand-medium)/현재(brand)/미완료(회색) (와이어프레임 S-06)
type Props = {
  total: number;
  current: number; // 0-based 현재 스텝 인덱스
};

export function StepProgress({ total, current }: Props) {
  return (
    <div className="flex gap-1.5" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => {
        const state = i < current ? 'done' : i === current ? 'current' : 'todo';
        return (
          <span
            key={i}
            className={[
              'h-1.5 flex-1 rounded-full',
              state === 'done'
                ? 'bg-brand-medium'
                : state === 'current'
                  ? 'bg-brand'
                  : 'bg-background-secondary',
            ].join(' ')}
          />
        );
      })}
    </div>
  );
}
