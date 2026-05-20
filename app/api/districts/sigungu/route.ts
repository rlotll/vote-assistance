import { fetchNec } from '@/lib/api/nec';
import type { Sigungu } from '@/types/domain';
import type { ApiResult } from '@/types/api';

export const revalidate = 86400; // 24시간 ISR 캐시

// 구시군코드 조회: getCommonGusigunCodeList (NEC 명세 — 코드정보 OpenAPI v3.12)
// 응답 필드: wiwName(구시군명), sdName(상위시도명), sgId, wOrder, num
interface RawGusigunItem {
  num?: string;
  sgId?: string;
  wiwName: string;
  wOrder?: string;
  sdName?: string;
}

// NEC raw에는 구시군 코드가 없음 — wiwName(명칭)을 code/districtCode로 임시 사용
// 향후 후보자/공약 조회 키 매핑이 필요해지면 별도 보강
function normalizeSigungu(raw: RawGusigunItem, sidoName: string): Sigungu {
  return {
    code: raw.wiwName,
    name: raw.wiwName,
    sidoCode: sidoName,
    districtCode: raw.wiwName,
  };
}

export async function GET(request: Request): Promise<Response> {
  if (!process.env.NEC_API_KEY) {
    return Response.json({ ok: true, data: [] } satisfies ApiResult<Sigungu[]>);
  }

  const { searchParams } = new URL(request.url);
  const sgId = searchParams.get('sgId');
  const sdName = searchParams.get('sdName');

  if (!sgId || !sdName) {
    return Response.json({
      ok: false,
      error: { code: 'UPSTREAM_INVALID_PARAM', message: 'sgId, sdName은 필수입니다.', retryable: false },
    } satisfies ApiResult<Sigungu[]>);
  }

  // 한 시/도 내 구시군은 보통 50건 미만 — 단일 호출
  const result = await fetchNec<RawGusigunItem>({
    service: 'CommonCodeService',
    operation: 'getCommonGusigunCodeList',
    params: { sgId, sdName },
  });

  if (!result.ok) {
    return Response.json(result satisfies ApiResult<Sigungu[]>);
  }

  // wiwName이 비어 있는 항목(시도 단위만 존재하는 광역시 직할 등) 제외
  const sigungus = result.data
    .filter((raw) => raw.wiwName && raw.wiwName.trim().length > 0)
    .map((raw) => normalizeSigungu(raw, sdName));

  return Response.json({ ok: true, data: sigungus } satisfies ApiResult<Sigungu[]>);
}
