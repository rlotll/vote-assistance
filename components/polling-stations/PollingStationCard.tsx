import { MapPin, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { PollingStation } from '@/types/domain';

type Props = { station: PollingStation; onSelect: (id: string) => void };

export function PollingStationCard({ station, onSelect }: Props) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(station.id)}
        className="w-full text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus-ring)] rounded-card"
        aria-label={`${station.name} 지도에서 보기`}
      >
        <Card variant="default">
          <div className="flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-[length:var(--font-size-body)] text-text-primary font-medium leading-snug">
                {station.name}
              </h3>
              {station.isEarlyVoting && (
                <Badge variant="early-voting">사전투표소</Badge>
              )}
            </div>
            <div className="flex items-start gap-1.5">
              <MapPin className="w-4 h-4 text-text-secondary shrink-0 mt-0.5" aria-hidden="true" />
              <p className="text-[length:var(--font-size-caption)] text-text-secondary">
                {station.address}
                {station.floor ? ` · ${station.floor}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-text-secondary shrink-0" aria-hidden="true" />
              <p className="text-[length:var(--font-size-caption)] text-text-secondary">
                {station.hours}
              </p>
            </div>
          </div>
        </Card>
      </button>
    </li>
  );
}
