'use client';

import { useUserStore } from '@/stores/userStore';
import { Badge } from '@/components/ui/Badge';

export function DistrictBadgeRow() {
  const district = useUserStore((s) => s.district);
  const residenceDiffers = useUserStore((s) => s.residenceDiffersFromRegistration);

  if (!district) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[length:var(--font-size-body)] text-text-primary font-medium">
        {district.sido.name} {district.sigungu.name}
      </span>
      {residenceDiffers && (
        <Badge variant="early-voting">사전투표 대상</Badge>
      )}
    </div>
  );
}
