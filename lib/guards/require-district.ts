import type { District } from '@/types/domain';

// district가 null이면 선거구 설정 페이지로 리다이렉트가 필요함을 나타내는 유틸
export function needsDistrictSetup(district: District | null): district is null {
  return district === null;
}
