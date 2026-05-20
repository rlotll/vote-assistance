import { fetchNec } from '@/lib/api/nec';
import { normalizePartyPledges, type RawPartyPledgeItem } from '@/lib/parties/normalize';
import type { PartyWithPledges } from '@/types/domain';
import type { ApiResult } from '@/types/api';

export const revalidate = 600; // 10분 ISR 캐시 — api_contract §2.5

export async function GET(request: Request): Promise<Response> {
  // 키 미발급 상태: 빈 응답으로 처리 (project_route_handler_pattern)
  if (!process.env.NEC_API_KEY) {
    return Response.json({ ok: true, data: [] } satisfies ApiResult<PartyWithPledges[]>);
  }

  const { searchParams } = new URL(request.url);
  const sgId = searchParams.get('sgId');
  const sgTypecode = searchParams.get('sgTypecode');

  if (!sgId || !sgTypecode) {
    return Response.json({
      ok: false,
      error: { code: 'UPSTREAM_INVALID_PARAM', message: 'sgId, sgTypecode는 필수입니다.', retryable: false },
    } satisfies ApiResult<PartyWithPledges[]>);
  }

  // partyName 미지정 시 전체 정당 정책 반환 가정 → 서버에서 정당별 그룹핑 (api_contract §4.4)
  const accumulated: RawPartyPledgeItem[] = [];
  for (let pageNo = 1; pageNo <= 20; pageNo++) {
    const page = await fetchNec<RawPartyPledgeItem>({
      service: 'PartyPlcInfoInqireService',
      operation: 'getPartyPlcInfoInqire',
      params: { sgId, sgTypecode, pageNo },
    });

    if (!page.ok) {
      if (accumulated.length === 0) {
        return Response.json(page satisfies ApiResult<PartyWithPledges[]>);
      }
      break;
    }
    accumulated.push(...page.data);
    if (page.data.length < 100) break;
  }

  const parties = normalizePartyPledges(accumulated);
  return Response.json({ ok: true, data: parties } satisfies ApiResult<PartyWithPledges[]>);
}
