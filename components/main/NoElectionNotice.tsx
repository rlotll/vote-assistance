import { CalendarClock } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function NoElectionNotice() {
  return (
    <Card variant="info">
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <CalendarClock className="w-8 h-8 text-brand" aria-hidden="true" />
        <h2 className="text-[length:var(--font-size-body)] font-medium text-text-primary">
          현재 진행 중인 선거가 없어요
        </h2>
        <p className="text-[length:var(--font-size-caption)] text-text-secondary">
          다음 예정 선거 정보는 선거관리위원회에서 일정 공지 시 자동 반영됩니다
        </p>
      </div>
    </Card>
  );
}
