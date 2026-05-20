import { MapPin } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export function EarlyVotingNotice() {
  return (
    <Card variant="info">
      <div className="flex items-start gap-3">
        <MapPin className="w-5 h-5 text-early-voting-fg shrink-0 mt-0.5" aria-hidden="true" />
        <div className="flex flex-col gap-1">
          <Badge variant="early-voting">사전투표 대상</Badge>
          <p className="text-[length:var(--font-size-body)] text-text-primary">
            사전투표 대상입니다. 전국 어디서나 사전투표소에서 투표하실 수 있어요!
          </p>
        </div>
      </div>
    </Card>
  );
}
