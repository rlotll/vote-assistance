import { fetchNec } from '@/lib/api/nec';
import { normalizeCandidatePledges, type RawCandidatePledgeItem } from '@/lib/pledges/normalize';
import type { Pledge } from '@/types/domain';
import type { ApiResult } from '@/types/api';

export const revalidate = 600; // 10분 ISR 캐시 — api_contract §2.5 (선거기간 갱신)

export async function GET(request: Request): Promise<Response> {
  // 키 미발급 상태: 빈 응답으로 처리 (project_route_handler_pattern)
  if (!process.env.NEC_API_KEY) {
    return Response.json({ ok: true, data: [] } satisfies ApiResult<Pledge[]>);
  }

  const { searchParams } = new URL(request.url);
  const sgId = searchParams.get('sgId');
  const sgTypecode = searchParams.get('sgTypecode');
  const huboid = searchParams.get('huboid');

  if (!sgId || !sgTypecode || !huboid) {
    return Response.json({
      ok: false,
      error: { code: 'UPSTREAM_INVALID_PARAM', message: 'sgId, sgTypecode, huboid는 필수입니다.', retryable: false },
    } satisfies ApiResult<Pledge[]>);
  }

  // 후보 1인 공약은 단일 item(와이드 포맷) — 단일 호출
  const page = await fetchNec<RawCandidatePledgeItem>({
    service: 'ElecPrmsInfoInqireService',
    operation: 'getCnddtElecPrmsInfoInqire',
    params: { sgId, sgTypecode, cnddtId: huboid },
  });

  if (!page.ok) {
    return Response.json(page satisfies ApiResult<Pledge[]>);
  }

  const pledges = normalizeCandidatePledges(page.data, huboid);
  return Response.json({ ok: true, data: pledges } satisfies ApiResult<Pledge[]>);
}
